-- Fix critical security vulnerability: Remove public access to sensitive verification data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service role can manage email verifications" ON public.email_verifications;
DROP POLICY IF EXISTS "Service role can create password reset codes" ON public.password_reset_codes;
DROP POLICY IF EXISTS "Service role can read password reset codes" ON public.password_reset_codes;
DROP POLICY IF EXISTS "Service role can update password reset codes" ON public.password_reset_codes;

-- Create secure policies for email_verifications table
-- Only service role can manage email verification tokens
CREATE POLICY "Service role only: Insert email verifications"
ON public.email_verifications
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role only: Read email verifications"
ON public.email_verifications
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role only: Update email verifications"
ON public.email_verifications
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role only: Delete email verifications"
ON public.email_verifications
FOR DELETE
TO service_role
USING (true);

-- Create secure policies for password_reset_codes table
-- Only service role can manage password reset codes
CREATE POLICY "Service role only: Insert password reset codes"
ON public.password_reset_codes
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role only: Read password reset codes"
ON public.password_reset_codes
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role only: Update password reset codes"
ON public.password_reset_codes
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role only: Delete password reset codes"
ON public.password_reset_codes
FOR DELETE
TO service_role
USING (true);