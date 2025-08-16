
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration for presentation generation
const MAX_RETRIES = 2;
const INITIAL_DELAY = 1000;
const API_TIMEOUT = 60000; // 60 seconds for presentation generation

// Helper functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Presentation generation attempt ${attempt + 1}/${retries + 1}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
      
      // Don't retry client errors
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} - ${await response.text()}`);
      }
      
      // Retry server errors
      if (attempt < retries) {
        const backoffDelay = INITIAL_DELAY * Math.pow(2, attempt);
        console.log(`Server error ${response.status}, retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
        continue;
      }
      
      throw new Error(`Server error: ${response.status} - ${await response.text()}`);
      
    } catch (error) {
      if (attempt < retries && !error.name?.includes('AbortError')) {
        const backoffDelay = INITIAL_DELAY * Math.pow(2, attempt);
        console.log(`Request failed, retrying in ${backoffDelay}ms...`, error.message);
        await delay(backoffDelay);
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Enhanced JSON extraction with better error handling
function extractJSON(text: string): any {
  let jsonText = text.trim();
  
  // Remove code block markers
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  
  // Find JSON object boundaries
  const start = jsonText.indexOf('{');
  const end = jsonText.lastIndexOf('}');
  
  if (start !== -1 && end !== -1 && end > start) {
    jsonText = jsonText.substring(start, end + 1);
  }
  
  try {
    const parsed = JSON.parse(jsonText);
    
    // Validate structure
    if (!parsed.title || !parsed.oneLiner || !parsed.structure || !Array.isArray(parsed.structure)) {
      throw new Error('Invalid presentation structure');
    }
    
    return parsed;
  } catch (parseError) {
    console.error('JSON parsing failed:', parseError.message);
    console.error('Attempted to parse:', jsonText);
    throw new Error('Failed to parse presentation data from AI response');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    
    if (!transcript || transcript.trim().length < 10) {
      throw new Error('Transcript is too short or empty. Please provide more content.');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Starting presentation generation with enhanced reliability');

    // Optimized prompt for better consistency
    const prompt = `You are an expert presentation creator. Create a professional, engaging presentation from the following content.

STRICT REQUIREMENTS:
1. Respond in the SAME LANGUAGE as the input text
2. Create 5-7 well-structured sections
3. Use relevant emojis for visual appeal
4. Make content presentation-ready
5. Return ONLY valid JSON in this exact format:

{
  "title": "🎯 [Professional title with emoji]",
  "oneLiner": "✨ [Compelling summary]", 
  "language": "[detected language code]",
  "structure": [
    {
      "section": "📋 [Section name with emoji]",
      "content": "[Detailed content with bullet points and emojis]"
    }
  ]
}

INPUT TEXT: "${transcript.trim()}"

Respond with valid JSON only:`;

    // Enhanced request configuration
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3, // More consistent output
        maxOutputTokens: 8192, // Increased limit
        topP: 0.8,
        topK: 40,
        candidateCount: 1
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    // Use enhanced fetch with retry logic
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No presentation data received from AI');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('AI response received, extracting presentation data...');
    
    // Enhanced JSON extraction
    const presentationData = extractJSON(responseText);
    
    // Additional validation
    if (presentationData.structure.length < 3) {
      throw new Error('Presentation structure is too short. Please provide more content.');
    }
    
    console.log('Presentation generated successfully:', {
      title: presentationData.title,
      sections: presentationData.structure.length,
      language: presentationData.language
    });
    
    return new Response(
      JSON.stringify({
        ...presentationData,
        success: true,
        generatedAt: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-presentation function:', error);
    
    // Enhanced error messages
    let errorMessage = error.message;
    if (error.name === 'AbortError') {
      errorMessage = 'Presentation generation timed out. Please try with shorter content.';
    } else if (errorMessage.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again in a few minutes.';
    } else if (errorMessage.includes('authentication')) {
      errorMessage = 'Authentication failed. Please check API configuration.';
    } else if (errorMessage.includes('parse')) {
      errorMessage = 'Failed to generate valid presentation format. Please try again.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
