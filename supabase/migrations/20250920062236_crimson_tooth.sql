/*
  # Create storage bucket for documents

  1. Storage Setup
    - Create 'documents' bucket for PDS files and other documents
    - Enable public access for file downloads
    - Set up RLS policies for secure access

  2. Security
    - Allow authenticated users to upload files
    - Allow public read access for signed URLs
    - Restrict delete operations to file owners
*/

-- Create the documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow public read access (needed for signed URLs)
CREATE POLICY "Public read access for documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = owner);

-- Policy: Allow users to update their own files
CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = owner);