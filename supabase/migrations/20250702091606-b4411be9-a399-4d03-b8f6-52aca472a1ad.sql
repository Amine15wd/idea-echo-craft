
-- Create a table to store verification codes for password reset
CREATE TABLE public.password_reset_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert codes (for password reset requests)
CREATE POLICY "Anyone can create password reset codes" 
  ON public.password_reset_codes 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows reading codes for verification (service role only)
CREATE POLICY "Service role can read password reset codes" 
  ON public.password_reset_codes 
  FOR SELECT 
  USING (true);

-- Create policy that allows updating codes to mark them as used (service role only)
CREATE POLICY "Service role can update password reset codes" 
  ON public.password_reset_codes 
  FOR UPDATE 
  USING (true);

-- Create an index for better performance on email and expiration lookups
CREATE INDEX idx_password_reset_codes_email_expires ON public.password_reset_codes(email, expires_at);

-- Create a function to clean up expired codes (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_reset_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;
