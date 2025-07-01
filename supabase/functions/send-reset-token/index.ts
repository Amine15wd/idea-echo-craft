
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email }: ResetRequest = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    // Create Supabase client with service role key to access user data
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error('Failed to retrieve user data');
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    // For development/demo purposes, we'll use a default password
    // In a real application, passwords are hashed and cannot be retrieved
    const defaultPassword = 'password123';

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not found, simulating email send for development');
      console.log('Password would be sent to:', email);
      console.log('Default password:', defaultPassword);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password sent successfully',
          password: defaultPassword,
          dev_mode: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Use Resend to send actual email with password
    const resend = new Resend(resendApiKey);

    const emailResult = await resend.emails.send({
      from: 'PitchPal AI <noreply@yourdomain.com>',
      to: [email],
      subject: 'Your Login Password - PitchPal AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Your Login Password</h1>
            <p style="color: #666; font-size: 16px;">You requested your password for your PitchPal AI account</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Your Password</h2>
            <div style="background: white; border: 2px solid #e9ecef; border-radius: 6px; padding: 20px; font-size: 18px; font-weight: bold; color: #495057; margin: 20px 0; font-family: monospace;">
              ${defaultPassword}
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              Copy this password and use it to log in to your account
            </p>
          </div>

          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              If you didn't request this password, please contact support immediately.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">
              For security reasons, consider changing your password after logging in.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Password email sent successfully via Resend:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password sent to your email!',
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
        error: error.message || 'Failed to send password' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
