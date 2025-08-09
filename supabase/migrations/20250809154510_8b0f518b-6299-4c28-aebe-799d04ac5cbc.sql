-- Create storage bucket for PowerPoint files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'presentations-pptx', 
  'presentations-pptx', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/vnd.openxmlformats-officedocument.presentationml.presentation']::text[]
);

-- Create storage policies for PPTX files
CREATE POLICY "Users can view their own PPTX files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'presentations-pptx' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own PPTX files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'presentations-pptx' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own PPTX files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'presentations-pptx' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own PPTX files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'presentations-pptx' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add pptx_file_path column to presentations table
ALTER TABLE presentations ADD COLUMN pptx_file_path TEXT;