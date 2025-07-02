
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email }: VerificationRequest = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user exists
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error('Failed to retrieve user data');
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store the verification code in database
    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert([
        {
          email,
          code: verificationCode,
          expires_at: expiresAt,
          used: false
        }
      ]);

    if (insertError) {
      console.error('Error storing verification code:', insertError);
      throw new Error('Failed to store verification code');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not found, simulating email send for development');
      console.log('Verification code would be sent to:', email);
      console.log('Verification code:', verificationCode);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully',
          code: verificationCode, // Only for development
          dev_mode: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use Resend to send actual email with verification code
    const resend = new Resend(resendApiKey);

    const emailResult = await resend.emails.send({
      from: 'PitchPal AI <noreply@yourdomain.com>',
      to: [email],
      subject: 'Password Reset Verification Code - PitchPal AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Password Reset</h1>
            <p style="color: #666; font-size: 16px;">You requested to reset your password for your PitchPal AI account</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Your Verification Code</h2>
            <div style="background: white; border: 2px solid #e9ecef; border-radius: 6px; padding: 20px; font-size: 24px; font-weight: bold; color: #495057; margin: 20px 0; font-family: monospace; letter-spacing: 4px;">
              ${verificationCode}
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              This verification code will expire in 10 minutes
            </p>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              If you didn't request a password reset, please ignore this email.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              This code is valid for 10 minutes only.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Verification code email sent successfully via Resend:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent to your email!',
        email_id: emailResult.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-verification-code function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send verification code' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
