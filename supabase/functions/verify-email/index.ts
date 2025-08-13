import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyEmailRequest {
  token: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token }: VerifyEmailRequest = await req.json();

    if (!token) {
      throw new Error('Verification token is required');
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if token exists and is valid
    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .eq('verified', false)
      .single();

    if (fetchError || !verification) {
      throw new Error('Invalid or expired verification token');
    }

    // Check if token has expired
    if (new Date(verification.expires_at) < new Date()) {
      throw new Error('Verification token has expired');
    }

    // Mark token as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('token', token);

    if (updateError) {
      console.error('Error updating verification status:', updateError);
      throw new Error('Failed to verify email');
    }

    // Update user's email_confirmed_at in auth.users via admin API
    const { error: userUpdateError } = await supabase.auth.admin.updateUserById(
      verification.user_id,
      { email_confirm: true }
    );

    if (userUpdateError) {
      console.error('Error confirming user email:', userUpdateError);
      // Continue anyway as the verification record is updated
    }

    console.log('Email verified successfully for user:', verification.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified successfully!',
        user_id: verification.user_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in verify-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to verify email' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});