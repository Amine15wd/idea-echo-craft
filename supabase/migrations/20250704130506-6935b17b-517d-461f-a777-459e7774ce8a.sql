-- Create presentations table for persistent storage
CREATE TABLE public.presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  one_liner TEXT NOT NULL,
  duration TEXT,
  transcript TEXT,
  structure JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own presentations" 
ON public.presentations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presentations" 
ON public.presentations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations" 
ON public.presentations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations" 
ON public.presentations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_presentations_updated_at
BEFORE UPDATE ON public.presentations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();