/*
  # Create PDS documents table

  1. New Tables
    - `pds_documents`
      - `id` (uuid, primary key)
      - `name` (text, document name)
      - `insurer` (text, insurance company name)
      - `version` (text, document version)
      - `effective_date` (date, when policy takes effect)
      - `file_uri` (text, path to file in storage)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `pds_documents` table
    - Add policy for authenticated users to read all PDS documents
    - Add policy for authenticated users to create PDS documents
*/

CREATE TABLE IF NOT EXISTS pds_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  insurer text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  file_uri text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pds_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all PDS documents
CREATE POLICY "Authenticated users can read PDS documents"
  ON pds_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to create PDS documents
CREATE POLICY "Authenticated users can create PDS documents"
  ON pds_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update PDS documents
CREATE POLICY "Authenticated users can update PDS documents"
  ON pds_documents
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to delete PDS documents
CREATE POLICY "Authenticated users can delete PDS documents"
  ON pds_documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS pds_documents_insurer_idx ON pds_documents(insurer);
CREATE INDEX IF NOT EXISTS pds_documents_created_at_idx ON pds_documents(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pds_documents_updated_at 
    BEFORE UPDATE ON pds_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();