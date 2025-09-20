/*
  # Create companies table

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `company_name` (text, not null)
      - `abn` (text, optional)
      - `address` (text, optional)
      - `phone` (text, optional)
      - `email` (text, optional)
      - `website` (text, optional)
      - `industry` (text, optional)
      - `job_reminder_threshold_hours` (integer, default 24)
      - `assessment_overdue_threshold_hours` (integer, default 48)
      - `max_assessments_per_day` (integer, default 5)
      - `break_time_minutes` (integer, default 30)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `companies` table
    - Add policies for authenticated users to read companies
    - Add policies for admins to manage companies
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  abn text,
  address text,
  phone text,
  email text,
  website text,
  industry text,
  job_reminder_threshold_hours integer DEFAULT 24 CHECK (job_reminder_threshold_hours > 0),
  assessment_overdue_threshold_hours integer DEFAULT 48 CHECK (assessment_overdue_threshold_hours > 0),
  max_assessments_per_day integer DEFAULT 5 CHECK (max_assessments_per_day > 0),
  break_time_minutes integer DEFAULT 30 CHECK (break_time_minutes >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS companies_company_name_idx ON companies(company_name);
CREATE INDEX IF NOT EXISTS companies_is_active_idx ON companies(is_active);

-- Add foreign key constraint to users table
ALTER TABLE users 
ADD CONSTRAINT users_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- RLS Policies
CREATE POLICY "Authenticated users can read companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Company admins can update their company"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND company_id = companies.id
      AND user_role IN ('company_admin', 'platform_admin')
    )
  );

CREATE POLICY "Platform admins can manage all companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_role = 'platform_admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();