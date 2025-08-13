-- Drop all existing policies on password_reset_codes to ensure clean state
DROP POLICY IF EXISTS "Anyone can create password reset codes" ON password_reset_codes;
DROP POLICY IF EXISTS "Only service role can read password reset codes" ON password_reset_codes;
DROP POLICY IF EXISTS "Only service role can update password reset codes" ON password_reset_codes;
DROP POLICY IF EXISTS "Service role can read password reset codes" ON password_reset_codes;
DROP POLICY IF EXISTS "Service role can update password reset codes" ON password_reset_codes;

-- Create secure policies that strictly limit access to service role only
-- INSERT policy for creating reset codes (used by edge functions)
CREATE POLICY "Service role can create password reset codes" 
ON password_reset_codes 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- SELECT policy restricted to service role only (no public access)
CREATE POLICY "Service role can read password reset codes" 
ON password_reset_codes 
FOR SELECT 
TO service_role
USING (true);

-- UPDATE policy restricted to service role only
CREATE POLICY "Service role can update password reset codes" 
ON password_reset_codes 
FOR UPDATE 
TO service_role
USING (true);