-- Add audio_url column to presentations table to store generated audio
ALTER TABLE public.presentations 
ADD COLUMN audio_url TEXT;