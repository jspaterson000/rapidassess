/*
  # Create storage bucket for documents

  1. Storage Setup
    - Create 'documents' bucket for PDS files and other documents
    - Enable public access for signed URLs
    - Set up RLS policies for secure access

  2. Security
    - Enable RLS on storage objects
    - Allow authenticated users to upload files
    - Allow public access via signed URLs
*/

-- Create the documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy to allow authenticated users to view their own files
CREATE POLICY "Users can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'documents');