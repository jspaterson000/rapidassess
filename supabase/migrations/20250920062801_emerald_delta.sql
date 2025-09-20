/*
  # Complete Production Schema for Assessment System

  1. New Tables
    - `users` - User accounts with authentication
    - `companies` - Company/organization management
    - `jobs` - Job postings and assignments
    - `assessments` - Assessment records and results
    - `assessment_questions` - Question bank for assessments
    - `assessment_responses` - User responses to questions
    - `skills` - Skills taxonomy
    - `industries` - Industry categories
    - `locations` - Geographic locations
    - `user_skills` - User skill proficiency mapping
    - `job_skills` - Required skills for jobs
    - `notifications` - System notifications
    - `audit_logs` - System audit trail
    - `pds_documents` - Policy documents storage

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Implement audit logging

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize for assessment workflow queries
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('platform_admin', 'company_admin', 'manager', 'assessor', 'user');
CREATE TYPE job_status AS ENUM ('new_job', 'awaiting_booking', 'awaiting_attendance', 'assessed', 'pending_completion', 'awaiting_insurer', 'completed', 'on_hold', 'archived');
CREATE TYPE job_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE event_type AS ENUM ('storm', 'fire', 'escape_of_liquid', 'impact', 'other');
CREATE TYPE assessment_status AS ENUM ('in_progress', 'completed', 'pending_review', 'archived');
CREATE TYPE notification_type AS ENUM ('mention', 'assignment', 'reminder', 'system');

-- Users table with authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  full_name text NOT NULL,
  phone text,
  user_role user_role DEFAULT 'user',
  company_id uuid,
  is_assessor boolean DEFAULT false,
  base_location text,
  work_start_time time DEFAULT '08:00',
  work_end_time time DEFAULT '17:00',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  email_verified boolean DEFAULT false,
  reset_token text,
  reset_token_expires timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  abn text,
  address text,
  phone text,
  email text,
  website text,
  industry text,
  job_reminder_threshold_hours integer DEFAULT 24,
  assessment_overdue_threshold_hours integer DEFAULT 48,
  max_assessments_per_day integer DEFAULT 5,
  break_time_minutes integer DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Industries reference table
CREATE TABLE IF NOT EXISTS industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Skills reference table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Locations reference table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text NOT NULL,
  country text DEFAULT 'Australia',
  postal_code text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  property_address text NOT NULL,
  event_type event_type NOT NULL,
  date_of_loss date NOT NULL,
  priority job_priority DEFAULT 'medium',
  status job_status DEFAULT 'new_job',
  insurer text,
  policy_number text,
  notes text,
  company_id uuid NOT NULL,
  assigned_to uuid,
  time_assigned timestamptz,
  appointment_date timestamptz,
  pds_document_id uuid,
  assessment_id uuid,
  total_estimate decimal(12,2) DEFAULT 0,
  scope_of_works jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PDS Documents table
CREATE TABLE IF NOT EXISTS pds_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  insurer text NOT NULL,
  version text DEFAULT '1.0',
  effective_date date DEFAULT CURRENT_DATE,
  file_uri text NOT NULL,
  file_size bigint,
  content_type text,
  uploaded_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  assessor_id uuid NOT NULL,
  company_id uuid NOT NULL,
  assessment_date timestamptz DEFAULT now(),
  status assessment_status DEFAULT 'in_progress',
  event_details jsonb DEFAULT '{}',
  damage_areas jsonb DEFAULT '[]',
  photos jsonb DEFAULT '[]',
  documents jsonb DEFAULT '[]',
  ai_analysis jsonb DEFAULT '{}',
  scope_of_works jsonb DEFAULT '[]',
  total_estimate decimal(12,2) DEFAULT 0,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assessment Questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'text', 'rating', 'boolean')),
  options jsonb DEFAULT '[]',
  category text,
  weight decimal(3,2) DEFAULT 1.0,
  is_required boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Assessment Responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  question_id uuid NOT NULL,
  response_value text,
  score decimal(5,2),
  created_at timestamptz DEFAULT now()
);

-- User Skills mapping
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  proficiency_level integer CHECK (proficiency_level BETWEEN 1 AND 5),
  years_experience integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Job Skills requirements
CREATE TABLE IF NOT EXISTS job_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  required_level integer CHECK (required_level BETWEEN 1 AND 5),
  is_mandatory boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, skill_id)
);

-- Comments/Notes table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  mentioned_user_ids uuid[] DEFAULT '{}',
  is_internal boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  sender_id uuid,
  job_id uuid,
  assessment_id uuid,
  comment_id uuid,
  type notification_type NOT NULL,
  title text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_pds_document FOREIGN KEY (pds_document_id) REFERENCES pds_documents(id) ON DELETE SET NULL;
ALTER TABLE pds_documents ADD CONSTRAINT fk_pds_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE assessments ADD CONSTRAINT fk_assessments_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
ALTER TABLE assessments ADD CONSTRAINT fk_assessments_assessor FOREIGN KEY (assessor_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE assessments ADD CONSTRAINT fk_assessments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE assessment_responses ADD CONSTRAINT fk_responses_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;
ALTER TABLE assessment_responses ADD CONSTRAINT fk_responses_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE;
ALTER TABLE user_skills ADD CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_skills ADD CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE;
ALTER TABLE job_skills ADD CONSTRAINT fk_job_skills_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
ALTER TABLE job_skills ADD CONSTRAINT fk_job_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT fk_comments_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pds_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Platform admins can manage all users" ON users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'platform_admin')
);
CREATE POLICY "Company admins can manage company users" ON users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('platform_admin', 'company_admin') AND company_id = users.company_id)
);

-- RLS Policies for companies
CREATE POLICY "Users can read own company" ON companies FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND company_id = companies.id)
);
CREATE POLICY "Company admins can update own company" ON companies FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('platform_admin', 'company_admin') AND company_id = companies.id)
);
CREATE POLICY "Platform admins can manage all companies" ON companies FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'platform_admin')
);

-- RLS Policies for reference tables (read-only for authenticated users)
CREATE POLICY "Authenticated users can read industries" ON industries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read skills" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read locations" ON locations FOR SELECT TO authenticated USING (true);

-- RLS Policies for jobs
CREATE POLICY "Users can read company jobs" ON jobs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (
    user_role = 'platform_admin' OR 
    company_id = jobs.company_id OR
    id = jobs.assigned_to
  ))
);
CREATE POLICY "Company admins can manage company jobs" ON jobs FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (
    user_role = 'platform_admin' OR 
    (user_role IN ('company_admin', 'manager') AND company_id = jobs.company_id)
  ))
);
CREATE POLICY "Assessors can update assigned jobs" ON jobs FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND id = jobs.assigned_to)
);

-- RLS Policies for PDS documents
CREATE POLICY "Authenticated users can read PDS documents" ON pds_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform admins can manage PDS documents" ON pds_documents FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'platform_admin')
);

-- RLS Policies for assessments
CREATE POLICY "Users can read relevant assessments" ON assessments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (
    user_role = 'platform_admin' OR 
    company_id = assessments.company_id OR
    id = assessments.assessor_id
  ))
);
CREATE POLICY "Assessors can manage own assessments" ON assessments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND id = assessments.assessor_id)
);
CREATE POLICY "Company admins can manage company assessments" ON assessments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (
    user_role = 'platform_admin' OR 
    (user_role IN ('company_admin', 'manager') AND company_id = assessments.company_id)
  ))
);

-- RLS Policies for assessment questions
CREATE POLICY "Authenticated users can read questions" ON assessment_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform admins can manage questions" ON assessment_questions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'platform_admin')
);

-- RLS Policies for assessment responses
CREATE POLICY "Users can read relevant responses" ON assessment_responses FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM assessments a JOIN users u ON u.id = auth.uid() 
    WHERE a.id = assessment_responses.assessment_id AND (
      u.user_role = 'platform_admin' OR 
      u.company_id = a.company_id OR
      u.id = a.assessor_id
    ))
);
CREATE POLICY "Assessors can manage own responses" ON assessment_responses FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_responses.assessment_id AND a.assessor_id = auth.uid())
);

-- RLS Policies for user skills
CREATE POLICY "Users can read own skills" ON user_skills FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skills" ON user_skills FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Company admins can read company user skills" ON user_skills FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users u1 JOIN users u2 ON u2.id = auth.uid() 
    WHERE u1.id = user_skills.user_id AND u2.user_role IN ('platform_admin', 'company_admin', 'manager') 
    AND u1.company_id = u2.company_id)
);

-- RLS Policies for job skills
CREATE POLICY "Users can read job skills" ON job_skills FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM jobs j JOIN users u ON u.id = auth.uid() 
    WHERE j.id = job_skills.job_id AND (
      u.user_role = 'platform_admin' OR 
      u.company_id = j.company_id OR
      u.id = j.assigned_to
    ))
);
CREATE POLICY "Company admins can manage job skills" ON job_skills FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM jobs j JOIN users u ON u.id = auth.uid() 
    WHERE j.id = job_skills.job_id AND (
      u.user_role = 'platform_admin' OR 
      (u.user_role IN ('company_admin', 'manager') AND u.company_id = j.company_id)
    ))
);

-- RLS Policies for comments
CREATE POLICY "Users can read job comments" ON comments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM jobs j JOIN users u ON u.id = auth.uid() 
    WHERE j.id = comments.job_id AND (
      u.user_role = 'platform_admin' OR 
      u.company_id = j.company_id OR
      u.id = j.assigned_to
    ))
);
CREATE POLICY "Users can create comments on accessible jobs" ON comments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM jobs j JOIN users u ON u.id = auth.uid() 
    WHERE j.id = comments.job_id AND (
      u.user_role = 'platform_admin' OR 
      u.company_id = j.company_id OR
      u.id = j.assigned_to
    ))
);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- RLS Policies for notifications
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Users can create notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for audit logs
CREATE POLICY "Platform admins can read audit logs" ON audit_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'platform_admin')
);
CREATE POLICY "System can create audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(user_role);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_to ON jobs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_job_id ON assessments(job_id);
CREATE INDEX IF NOT EXISTS idx_assessments_assessor_id ON assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_assessments_company_id ON assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_comments_job_id ON comments(job_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pds_documents_updated_at BEFORE UPDATE ON pds_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to key tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_jobs AFTER INSERT OR UPDATE OR DELETE ON jobs FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_assessments AFTER INSERT OR UPDATE OR DELETE ON assessments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();