-- Remove PowerPoint functionality
DROP TABLE IF EXISTS storage.objects WHERE bucket_id = 'presentations-pptx';
DELETE FROM storage.buckets WHERE id = 'presentations-pptx';

-- Remove pptx_file_path column from presentations table
ALTER TABLE public.presentations DROP COLUMN IF EXISTS pptx_file_path;