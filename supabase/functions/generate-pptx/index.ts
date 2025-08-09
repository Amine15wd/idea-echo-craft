import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { presentation, userId } = await req.json();
    
    if (!presentation || !userId) {
      throw new Error('Presentation data and user ID are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate PPTX file using PptxGenJS
    const pptxContent = await generatePPTX(presentation);
    
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${userId}/${timestamp}-${presentation.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('presentations-pptx')
      .upload(fileName, pptxContent, {
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL (note: bucket is private, so this returns a signed URL)
    const { data: urlData } = await supabase
      .storage
      .from('presentations-pptx')
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath: fileName,
        downloadUrl: urlData?.signedUrl,
        message: 'PowerPoint presentation generated successfully!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-pptx function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generatePPTX(presentation: any): Promise<Uint8Array> {
  // Import PptxGenJS dynamically
  const PptxGenJS = (await import('https://esm.sh/pptxgenjs@3.12.0')).default;
  
  const pptx = new PptxGenJS();
  
  // Detect language and set text direction
  const isRTL = detectRTL(presentation.language || 'en');
  const textDirection = isRTL ? 'rtl' : 'ltr';
  
  // Helper function to clean and ensure string content
  const cleanText = (text: any): string => {
    if (!text) return '';
    const str = String(text);
    // Remove problematic characters that might cause issues with PptxGenJS
    return str.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').trim();
  };
  
  // Clean presentation data
  const cleanTitle = cleanText(presentation.title);
  const cleanOneLiner = cleanText(presentation.oneLiner);
  
  // Set presentation properties with cleaned text
  pptx.author = 'PitchPal AI';
  pptx.company = 'PitchPal AI';
  pptx.subject = cleanTitle;
  pptx.title = cleanTitle;

  // Define professional color scheme
  const colors = {
    primary: '2563eb', // Blue
    accent: '059669',  // Green  
    background: 'ffffff', // White
    text: '1f2937', // Dark gray
    light: 'f8fafc' // Light gray
  };

  // Create title slide
  const titleSlide = pptx.addSlide();
  
  // Background gradient for title slide
  titleSlide.background = { 
    fill: {
      type: 'gradient',
      colors: [
        { color: colors.primary, position: 0 },
        { color: colors.accent, position: 100 }
      ],
      angle: 45
    }
  };

  // Title
  titleSlide.addText(cleanTitle, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 36,
    fontFace: 'Arial',
    color: colors.background,
    bold: true,
    align: 'center',
    rtlMode: isRTL
  });

  // Subtitle
  titleSlide.addText(cleanOneLiner, {
    x: 0.5,
    y: 4.2,
    w: 9,
    h: 1,
    fontSize: 20,
    fontFace: 'Arial',
    color: colors.background,
    align: 'center',
    rtlMode: isRTL
  });

  // Add decorative elements
  titleSlide.addShape('rect', {
    x: 1,
    y: 5.5,
    w: 8,
    h: 0.1,
    fill: { color: colors.background, transparency: 70 }
  });

  // Create content slides
  presentation.structure?.forEach((section: any, index: number) => {
    const slide = pptx.addSlide();
    
    // Clean section data
    const cleanSectionTitle = cleanText(section.section);
    const cleanSectionContent = cleanText(section.content);
    
    // Professional background
    slide.background = { fill: colors.background };
    
    // Header bar
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 10,
      h: 0.8,
      fill: {
        type: 'gradient',
        colors: [
          { color: colors.primary, position: 0 },
          { color: colors.accent, position: 100 }
        ],
        angle: 0
      }
    });

    // Section number and title
    slide.addText(`${index + 1}. ${cleanSectionTitle}`, {
      x: 0.3,
      y: 0.1,
      w: 9.4,
      h: 0.6,
      fontSize: 20,
      fontFace: 'Arial',
      color: colors.background,
      bold: true,
      align: isRTL ? 'right' : 'left',
      rtlMode: isRTL
    });

    // Process content with bullet points
    const contentLines = cleanSectionContent.split('\n').filter((line: string) => line.trim());
    let currentY = 1.5;
    
    contentLines.forEach((line: string, lineIndex: number) => {
      const trimmedLine = cleanText(line.trim());
      if (!trimmedLine) return;
      
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        // Bullet point
        const bulletText = cleanText(trimmedLine.substring(1).trim());
        
        // Add bullet point shape
        slide.addShape('circle', {
          x: isRTL ? 9.2 : 0.5,
          y: currentY + 0.15,
          w: 0.1,
          h: 0.1,
          fill: colors.accent
        });
        
        slide.addText(bulletText, {
          x: isRTL ? 0.5 : 0.8,
          y: currentY,
          w: 8.5,
          h: 0.4,
          fontSize: 14,
          fontFace: 'Arial',
          color: colors.text,
          align: isRTL ? 'right' : 'left',
          rtlMode: isRTL
        });
      } else {
        // Regular paragraph
        slide.addText(trimmedLine, {
          x: 0.5,
          y: currentY,
          w: 9,
          h: 0.6,
          fontSize: 14,
          fontFace: 'Arial',
          color: colors.text,
          align: isRTL ? 'right' : 'left',
          rtlMode: isRTL
        });
      }
      currentY += 0.5;
    });

    // Add section number indicator
    slide.addShape('circle', {
      x: isRTL ? 0.2 : 9.3,
      y: 6.8,
      w: 0.5,
      h: 0.5,
      fill: colors.primary
    });
    
    slide.addText((index + 1).toString(), {
      x: isRTL ? 0.2 : 9.3,
      y: 6.8,
      w: 0.5,
      h: 0.5,
      fontSize: 18,
      fontFace: 'Arial',
      color: colors.background,
      bold: true,
      align: 'center'
    });
  });

  // Create conclusion slide
  const conclusionSlide = pptx.addSlide();
  conclusionSlide.background = { 
    fill: {
      type: 'gradient',
      colors: [
        { color: colors.accent, position: 0 },
        { color: colors.primary, position: 100 }
      ],
      angle: 135
    }
  };

  // Conclusion text based on language
  const thankYouText = isRTL ? 'شكرًا لكم!' : 'Thank You!';
  const discussionText = isRTL ? 'الأسئلة والمناقشة' : 'Questions & Discussion';
  
  conclusionSlide.addText(thankYouText, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 48,
    fontFace: 'Arial',
    color: colors.background,
    bold: true,
    align: 'center',
    rtlMode: isRTL
  });

  conclusionSlide.addText(discussionText, {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.8,
    fontSize: 24,
    fontFace: 'Arial',
    color: colors.background,
    align: 'center',
    rtlMode: isRTL
  });

  // Generate and return the PPTX file
  const pptxArrayBuffer = await pptx.write({ outputType: 'arraybuffer' });
  return new Uint8Array(pptxArrayBuffer as ArrayBuffer);
}

function detectRTL(language: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ku', 'ps'];
  return rtlLanguages.includes(language.toLowerCase());
}