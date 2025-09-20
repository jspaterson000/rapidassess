/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `claim_number` (text, unique, not null)
      - `customer_name` (text, not null)
      - `customer_phone` (text, optional)
      - `customer_email` (text, optional)
      - `property_address` (text, not null)
      - `event_type` (text, not null)
      - `date_of_loss` (date, not null)
      - `priority` (text, default 'medium')
      - `status` (text, default 'new_job')
      - `insurer` (text, optional)
      - `policy_number` (text, optional)
      - `notes` (text, optional)
      - `company_id` (uuid, not null, foreign key)
      - `assigned_to` (uuid, optional, foreign key to users)
      - `time_assigned` (timestamptz, optional)
      - `appointment_date` (timestamptz, optional)
      - `assessment_id` (uuid, optional)
      - `total_estimate` (numeric, default 0)
      - `scope_of_works` (jsonb, optional)
      - `pds_document_id` (uuid, optional)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `jobs` table
    - Add policies for company users to access their company's jobs
    - Add policies for assigned users to access their jobs
*/

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  property_address text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('storm', 'fire', 'escape_of_liquid', 'impact', 'other')),
  date_of_loss date NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'new_job' CHECK (status IN ('new_job', 'awaiting_booking', 'awaiting_attendance', 'assessed', 'pending_completion', 'awaiting_insurer', 'completed', 'on_hold', 'archived')),
  insurer text,
  policy_number text,
  notes text,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  time_assigned timestamptz,
  appointment_date timestamptz,
  assessment_id uuid,
  total_estimate numeric DEFAULT 0,
  scope_of_works jsonb,
  pds_document_id uuid REFERENCES pds_documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS jobs_claim_number_idx ON jobs(claim_number);
CREATE INDEX IF NOT EXISTS jobs_company_id_idx ON jobs(company_id);
CREATE INDEX IF NOT EXISTS jobs_assigned_to_idx ON jobs(assigned_to);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status);
CREATE INDEX IF NOT EXISTS jobs_priority_idx ON jobs(priority);
CREATE INDEX IF NOT EXISTS jobs_event_type_idx ON jobs(event_type);
CREATE INDEX IF NOT EXISTS jobs_date_of_loss_idx ON jobs(date_of_loss);
CREATE INDEX IF NOT EXISTS jobs_appointment_date_idx ON jobs(appointment_date);

-- RLS Policies
CREATE POLICY "Users can access their company jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (company_id = jobs.company_id OR user_role = 'platform_admin')
    )
  );

CREATE POLICY "Users can access assigned jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Admins can manage company jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        (company_id = jobs.company_id AND user_role IN ('company_admin', 'manager')) OR
        user_role = 'platform_admin'
      )
    )
  );

CREATE POLICY "Assigned users can update their jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();