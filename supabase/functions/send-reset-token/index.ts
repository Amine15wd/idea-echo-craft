
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetRequest {
  email: string;
  token: string;
  redirectUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, token, redirectUrl }: ResetRequest = await req.json();

    if (!email || !token) {
      throw new Error('Email and token are required');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not found, simulating email send for development');
      
      // In development, just log the token
      console.log('Password reset email would be sent to:', email);
      console.log('Reset token:', token);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Reset token sent successfully',
          // Return token for development testing
          token: token,
          dev_mode: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use Resend to send actual email
    const resend = new Resend(resendApiKey);

    const emailResult = await resend.emails.send({
      from: 'PitchPal AI <noreply@yourdomain.com>',
      to: [email],
      subject: 'Password Reset Code - PitchPal AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Password Reset</h1>
            <p style="color: #666; font-size: 16px;">You requested a password reset for your PitchPal AI account</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Your Reset Code</h2>
            <div style="background: white; border: 2px solid #e9ecef; border-radius: 6px; padding: 20px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #495057; margin: 20px 0;">
              ${token}
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              Copy this code and paste it in the password reset form
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${redirectUrl}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password Now
            </a>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              This reset code will expire in 1 hour for security reasons.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully via Resend:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Reset code sent to your email!',
        email_id: emailResult.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-reset-token function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send reset token' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
