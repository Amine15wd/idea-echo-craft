
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a world-class presentation expert who creates visually stunning, professionally formatted presentations. Analyze the given text and create a comprehensive, well-structured presentation in the SAME LANGUAGE as the input text.

CRITICAL REQUIREMENTS:
1. **Language**: Generate the entire presentation in the SAME LANGUAGE as the input text (Arabic, English, etc.)
2. **Professional Formatting**: Use appropriate emojis, visual hierarchy, and engaging content
3. **Visual Appeal**: Include relevant emojis for each section to enhance meaning and visual appeal
4. **Structure**: Create 5-8 well-organized sections with clear, actionable content
5. **Engagement**: Make each section compelling and ready for presentation without editing

Return ONLY valid JSON with this exact structure:
{
  "title": "🎯 Professional presentation title with relevant emoji",
  "oneLiner": "✨ Compelling one-line summary that captures the essence",
  "language": "detected language code (ar, en, etc.)",
  "structure": [
    {
      "section": "📋 Section name with relevant emoji",
      "content": "Detailed, well-formatted content with bullet points, emojis, and clear structure. Use • for bullet points, include relevant emojis throughout, and make it presentation-ready."
    }
  ]
}

INPUT TEXT TO ANALYZE: "${transcript}"`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No response received from Gemini');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response text to extract JSON
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const presentationData = JSON.parse(jsonText);
    
    return new Response(
      JSON.stringify(presentationData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-presentation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
