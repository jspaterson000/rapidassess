/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches Supabase auth.users.id
      - `email` (text, unique, not null)
      - `full_name` (text, not null)
      - `phone` (text, optional)
      - `user_role` (text, not null, default 'user')
      - `company_id` (uuid, optional, foreign key)
      - `is_assessor` (boolean, default false)
      - `base_location` (text, optional)
      - `work_start_time` (text, optional)
      - `work_end_time` (text, optional)
      - `is_active` (boolean, default true)
      - `last_login` (timestamptz, optional)
      - `email_verified` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read/update their own data
    - Add policies for admins to manage all users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  user_role text NOT NULL DEFAULT 'user' CHECK (user_role IN ('platform_admin', 'company_admin', 'manager', 'assessor', 'user')),
  company_id uuid,
  is_assessor boolean DEFAULT false,
  base_location text,
  work_start_time text,
  work_end_time text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_company_id_idx ON users(company_id);
CREATE INDEX IF NOT EXISTS users_user_role_idx ON users(user_role);
CREATE INDEX IF NOT EXISTS users_is_assessor_idx ON users(is_assessor);

-- RLS Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_role IN ('platform_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_role IN ('platform_admin', 'company_admin')
    )
  );

CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();