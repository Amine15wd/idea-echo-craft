import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationEmailRequest {
  email: string;
  userId: string;
  fullName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, userId, fullName }: VerificationEmailRequest = await req.json();

    if (!email || !userId) {
      throw new Error('Email and userId are required');
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    
    // Set expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Store the verification token in database
    const { error: insertError } = await supabase
      .from('email_verifications')
      .insert([
        {
          user_id: userId,
          email,
          token: verificationToken,
          expires_at: expiresAt,
          verified: false
        }
      ]);

    if (insertError) {
      console.error('Error storing verification token:', insertError);
      throw new Error('Failed to store verification token');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not found, simulating email send for development');
      console.log('Verification email would be sent to:', email);
      console.log('Verification link:', `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${verificationToken}&type=signup&redirect_to=${encodeURIComponent(`${req.headers.get('origin') || 'http://localhost:5173'}/dashboard`)}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification email sent successfully',
          dev_mode: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use Resend to send verification email
    const resend = new Resend(resendApiKey);
    const origin = req.headers.get('origin') || 'https://idea-echo-craft.lovable.app';
    const verificationUrl = `${origin}/verify-email?token=${verificationToken}`;

    const emailResult = await resend.emails.send({
      from: 'PitchPal AI <noreply@yourdomain.com>',
      to: [email],
      subject: 'Verify Your Email - PitchPal AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Welcome to PitchPal AI!</h1>
            <p style="color: #666; font-size: 16px;">${fullName ? `Hi ${fullName}, ` : ''}Please verify your email address to complete your account setup</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">Verify Your Email Address</h2>
            <a href="${verificationUrl}" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Or copy and paste this link in your browser:<br>
              <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              This verification link will expire in 24 hours
            </p>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              If you didn't create an account with PitchPal AI, please ignore this email.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              This link is valid for 24 hours only.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Verification email sent successfully via Resend:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully!',
        email_id: emailResult.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-verification-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send verification email' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});