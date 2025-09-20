/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `recipient_id` (uuid, not null, foreign key)
      - `sender_id` (uuid, optional, foreign key)
      - `job_id` (uuid, optional, foreign key)
      - `assessment_id` (uuid, optional, foreign key)
      - `comment_id` (uuid, optional, foreign key)
      - `type` (text, not null)
      - `title` (text, optional)
      - `content` (text, not null)
      - `is_read` (boolean, default false)
      - `read_at` (timestamptz, optional)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to access their own notifications
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE,
  comment_id uuid,
  type text NOT NULL CHECK (type IN ('mention', 'assignment', 'reminder', 'system')),
  title text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_recipient_id_idx ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS notifications_sender_id_idx ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS notifications_job_id_idx ON notifications(job_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- RLS Policies
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (recipient_id = auth.uid());