/*
  # Create comments table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `job_id` (uuid, not null, foreign key)
      - `author_id` (uuid, not null, foreign key)
      - `content` (text, not null)
      - `mentioned_user_ids` (jsonb, default '[]')
      - `is_internal` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `comments` table
    - Add policies for company users to access job comments
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  mentioned_user_ids jsonb DEFAULT '[]',
  is_internal boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS comments_job_id_idx ON comments(job_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON comments(author_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at);

-- Add foreign key constraint to notifications table
ALTER TABLE notifications 
ADD CONSTRAINT notifications_comment_id_fkey 
FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;

-- RLS Policies
CREATE POLICY "Users can read job comments for their company"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN users u ON u.id = auth.uid()
      WHERE j.id = comments.job_id 
      AND (j.company_id = u.company_id OR u.user_role = 'platform_admin')
    )
  );

CREATE POLICY "Users can create comments on their company jobs"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN users u ON u.id = auth.uid()
      WHERE j.id = comments.job_id 
      AND (j.company_id = u.company_id OR u.user_role = 'platform_admin')
    )
  );

CREATE POLICY "Authors can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();