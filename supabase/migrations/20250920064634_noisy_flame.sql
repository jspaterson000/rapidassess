/*
  # Create assessments table

  1. New Tables
    - `assessments`
      - `id` (uuid, primary key)
      - `job_id` (uuid, not null, foreign key)
      - `assessor_id` (uuid, not null, foreign key)
      - `company_id` (uuid, not null, foreign key)
      - `assessment_date` (timestamptz, not null)
      - `status` (text, default 'in_progress')
      - `event_details` (jsonb, default '{}')
      - `damage_areas` (jsonb, default '[]')
      - `photos` (jsonb, default '[]')
      - `documents` (jsonb, default '[]')
      - `ai_analysis` (jsonb, optional)
      - `scope_of_works` (jsonb, default '[]')
      - `total_estimate` (numeric, default 0)
      - `additional_notes` (text, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `assessments` table
    - Add policies for company users to access their assessments
    - Add policies for assessors to access their assessments
*/

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  assessor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assessment_date timestamptz NOT NULL,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'pending_review', 'archived')),
  event_details jsonb DEFAULT '{}',
  damage_areas jsonb DEFAULT '[]',
  photos jsonb DEFAULT '[]',
  documents jsonb DEFAULT '[]',
  ai_analysis jsonb,
  scope_of_works jsonb DEFAULT '[]',
  total_estimate numeric DEFAULT 0,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS assessments_job_id_idx ON assessments(job_id);
CREATE INDEX IF NOT EXISTS assessments_assessor_id_idx ON assessments(assessor_id);
CREATE INDEX IF NOT EXISTS assessments_company_id_idx ON assessments(company_id);
CREATE INDEX IF NOT EXISTS assessments_status_idx ON assessments(status);
CREATE INDEX IF NOT EXISTS assessments_assessment_date_idx ON assessments(assessment_date);

-- Add foreign key constraint to jobs table for assessment_id
ALTER TABLE jobs 
ADD CONSTRAINT jobs_assessment_id_fkey 
FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE SET NULL;

-- RLS Policies
CREATE POLICY "Users can access their company assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (company_id = assessments.company_id OR user_role = 'platform_admin')
    )
  );

CREATE POLICY "Assessors can access their assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (assessor_id = auth.uid());

CREATE POLICY "Assessors can create assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (assessor_id = auth.uid());

CREATE POLICY "Assessors can update their assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (assessor_id = auth.uid());

CREATE POLICY "Admins can manage company assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        (company_id = assessments.company_id AND user_role IN ('company_admin', 'manager')) OR
        user_role = 'platform_admin'
      )
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();