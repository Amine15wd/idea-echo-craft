
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  email: string;
  code: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyRequest = await req.json();

    if (!email || !code) {
      throw new Error('Email and verification code are required');
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if verification code exists and is valid
    const { data: codeData, error: codeError } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (codeError) {
      console.error('Error checking verification code:', codeError);
      throw new Error('Failed to verify code');
    }

    if (!codeData || codeData.length === 0) {
      throw new Error('Invalid or expired verification code');
    }

    // Mark the code as used
    const { error: updateError } = await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', codeData[0].id);

    if (updateError) {
      console.error('Error marking code as used:', updateError);
      throw new Error('Failed to update verification code');
    }

    // Generate a new random password (12 characters with mixed case, numbers, and symbols)
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const newPassword = generatePassword();

    // Get user by email and update their password
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error('Failed to retrieve user data');
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Update user password
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (passwordError) {
      console.error('Error updating password:', passwordError);
      throw new Error('Failed to update password');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not found, simulating email send for development');
      console.log('New password would be sent to:', email);
      console.log('New password:', newPassword);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset successfully',
          password: newPassword, // Only for development
          dev_mode: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use Resend to send new password via email
    const resend = new Resend(resendApiKey);

    const emailResult = await resend.emails.send({
      from: 'PitchPal AI <noreply@yourdomain.com>',
      to: [email],
      subject: 'Your New Password - PitchPal AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Password Reset Complete</h1>
            <p style="color: #666; font-size: 16px;">Your password has been successfully reset</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Your New Password</h2>
            <div style="background: white; border: 2px solid #e9ecef; border-radius: 6px; padding: 20px; font-size: 18px; font-weight: bold; color: #495057; margin: 20px 0; font-family: monospace;">
              ${newPassword}
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              Copy this password and use it to log in to your account
            </p>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              For security reasons, please change your password after logging in.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              If you didn't request this password reset, please contact support immediately.
            </p>
          </div>
        </div>
      `,
    });

    console.log('New password email sent successfully via Resend:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'New password sent to your email!',
        email_id: emailResult.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in verify-code-and-reset function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to reset password' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
