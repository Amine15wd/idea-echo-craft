-- Create email_verifications table for custom email verification
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for email_verifications (service role only for security)
CREATE POLICY "Service role can manage email verifications" 
ON public.email_verifications 
FOR ALL 
TO service_role
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_verifications_updated_at
BEFORE UPDATE ON public.email_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_email_verifications_token ON public.email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON public.email_verifications(user_id);
CREATE INDEX idx_email_verifications_expires_at ON public.email_verifications(expires_at);