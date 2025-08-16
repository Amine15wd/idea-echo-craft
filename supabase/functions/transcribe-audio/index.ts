
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const API_TIMEOUT = 45000; // 45 seconds

// Helper function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced fetch with timeout and retry logic
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`API attempt ${attempt + 1}/${retries + 1}`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // If successful, return immediately
      if (response.ok) {
        return response;
      }
      
      // For client errors (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} - ${await response.text()}`);
      }
      
      // For server errors (5xx), retry
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Starting enhanced transcription with Gemini API');

    // Optimized request body for better reliability
    const requestBody = {
      contents: [{
        parts: [
          {
            text: "Transcribe this audio accurately. Return only the clean transcribed text without any formatting, commentary, or additional text. If the audio is unclear or empty, return 'TRANSCRIPTION_FAILED'."
          },
          {
            inline_data: {
              mime_type: "audio/wav",
              data: audio
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.0, // More deterministic
        maxOutputTokens: 4096, // Increased limit
        topP: 0.8,
        topK: 10
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
    console.log('Gemini API response received');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No transcription received from Gemini API');
    }

    const transcribedText = data.candidates[0].content.parts[0].text?.trim();
    
    if (!transcribedText || transcribedText === 'TRANSCRIPTION_FAILED') {
      throw new Error('Audio transcription failed - content unclear or empty');
    }

    console.log('Transcription successful, length:', transcribedText.length);
    
    return new Response(
      JSON.stringify({ 
        text: transcribedText,
        success: true,
        processingTime: Date.now()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.name === 'AbortError') {
      errorMessage = 'Transcription timed out. Please try with a shorter audio file.';
    } else if (errorMessage.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (errorMessage.includes('authentication')) {
      errorMessage = 'Authentication failed. Please check API configuration.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        timestamp: Date.now()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
