/*
  # Create additional supporting tables

  1. New Tables
    - `skills` - Available skills for assessors
    - `industries` - Industry categories
    - `locations` - Available locations
    - `assessment_questions` - Questions for assessments
    - `assessment_responses` - User responses to assessments

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create industries table
CREATE TABLE IF NOT EXISTS industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  state text,
  country text DEFAULT 'Australia',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create assessment_questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'text', 'rating', 'boolean')),
  category text NOT NULL,
  options jsonb DEFAULT '[]',
  weight numeric DEFAULT 1.0,
  is_required boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assessment_responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  response_value text,
  score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS skills_name_idx ON skills(name);
CREATE INDEX IF NOT EXISTS skills_category_idx ON skills(category);
CREATE INDEX IF NOT EXISTS industries_name_idx ON industries(name);
CREATE INDEX IF NOT EXISTS locations_name_idx ON locations(name);
CREATE INDEX IF NOT EXISTS locations_state_idx ON locations(state);
CREATE INDEX IF NOT EXISTS assessment_questions_category_idx ON assessment_questions(category);
CREATE INDEX IF NOT EXISTS assessment_questions_is_active_idx ON assessment_questions(is_active);
CREATE INDEX IF NOT EXISTS assessment_responses_assessment_id_idx ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS assessment_responses_question_id_idx ON assessment_responses(question_id);

-- RLS Policies for skills
CREATE POLICY "Anyone can read active skills"
  ON skills
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage skills"
  ON skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_role = 'platform_admin'
    )
  );

-- RLS Policies for industries
CREATE POLICY "Anyone can read active industries"
  ON industries
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage industries"
  ON industries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_role = 'platform_admin'
    )
  );

-- RLS Policies for locations
CREATE POLICY "Anyone can read active locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage locations"
  ON locations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_role = 'platform_admin'
    )
  );

-- RLS Policies for assessment_questions
CREATE POLICY "Anyone can read active questions"
  ON assessment_questions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage questions"
  ON assessment_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_role = 'platform_admin'
    )
  );

-- RLS Policies for assessment_responses
CREATE POLICY "Users can read responses for their company assessments"
  ON assessment_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN users u ON u.id = auth.uid()
      WHERE a.id = assessment_responses.assessment_id 
      AND (a.company_id = u.company_id OR u.user_role = 'platform_admin')
    )
  );

CREATE POLICY "Assessors can manage their assessment responses"
  ON assessment_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_responses.assessment_id 
      AND a.assessor_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_assessment_questions_updated_at
  BEFORE UPDATE ON assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();