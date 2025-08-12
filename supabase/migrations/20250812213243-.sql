-- Remove the overly permissive SELECT policy that allows public access
DROP POLICY IF EXISTS "Service role can read password reset codes" ON password_reset_codes;

-- Create a more secure policy that only allows service role access
-- (Edge functions use service role, so this maintains functionality while blocking public access)
CREATE POLICY "Only service role can read password reset codes" 
ON password_reset_codes 
FOR SELECT 
TO service_role
USING (true);

-- Also restrict UPDATE to service role only for better security
DROP POLICY IF EXISTS "Service role can update password reset codes" ON password_reset_codes;

CREATE POLICY "Only service role can update password reset codes" 
ON password_reset_codes 
FOR UPDATE 
TO service_role
USING (true);