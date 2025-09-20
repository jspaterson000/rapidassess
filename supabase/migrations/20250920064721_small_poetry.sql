/*
  # Seed reference data

  1. Reference Data
    - Insert sample companies
    - Insert sample skills
    - Insert sample industries
    - Insert sample locations
    - Insert sample assessment questions

  2. Sample Users
    - Insert demo users with different roles
    - Link users to companies
*/

-- Insert sample companies
INSERT INTO companies (id, company_name, abn, address, phone, email, job_reminder_threshold_hours, assessment_overdue_threshold_hours, max_assessments_per_day, break_time_minutes) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'RapidAssess Insurance Services', '12 345 678 901', '123 Business Street, Sydney NSW 2000', '+61 2 9876 5432', 'contact@rapidassess.com', 24, 48, 5, 30),
('550e8400-e29b-41d4-a716-446655440002', 'Premier Assessment Group', '23 456 789 012', '456 Collins Street, Melbourne VIC 3000', '+61 3 8765 4321', 'info@premierassess.com', 12, 24, 8, 15),
('550e8400-e29b-41d4-a716-446655440003', 'National Claims Solutions', '34 567 890 123', '789 Queen Street, Brisbane QLD 4000', '+61 7 7654 3210', 'support@nationalclaims.com', 48, 72, 3, 45)
ON CONFLICT (id) DO NOTHING;

-- Insert sample skills
INSERT INTO skills (name, category, description) VALUES
('Property Assessment', 'Technical', 'Ability to assess property damage and value'),
('Insurance Knowledge', 'Domain', 'Understanding of insurance policies and procedures'),
('Report Writing', 'Communication', 'Skill in writing detailed assessment reports'),
('Customer Service', 'Interpersonal', 'Ability to interact professionally with clients'),
('Photography', 'Technical', 'Skill in documenting damage through photography'),
('Construction Knowledge', 'Technical', 'Understanding of building materials and construction'),
('Legal Compliance', 'Regulatory', 'Knowledge of insurance regulations and compliance'),
('Time Management', 'Organizational', 'Ability to manage multiple assessments efficiently')
ON CONFLICT (name) DO NOTHING;

-- Insert sample industries
INSERT INTO industries (name, description) VALUES
('Insurance', 'Insurance companies and related services'),
('Construction', 'Building and construction industry'),
('Real Estate', 'Property management and real estate services'),
('Legal Services', 'Law firms and legal consultation'),
('Financial Services', 'Banking and financial institutions'),
('Government', 'Government agencies and public sector')
ON CONFLICT (name) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (name, state) VALUES
('Sydney', 'NSW'),
('Melbourne', 'VIC'),
('Brisbane', 'QLD'),
('Perth', 'WA'),
('Adelaide', 'SA'),
('Canberra', 'ACT'),
('Darwin', 'NT'),
('Hobart', 'TAS'),
('Gold Coast', 'QLD'),
('Newcastle', 'NSW'),
('Wollongong', 'NSW'),
('Geelong', 'VIC'),
('Townsville', 'QLD'),
('Cairns', 'QLD'),
('Toowoomba', 'QLD'),
('Ballarat', 'VIC'),
('Bendigo', 'VIC'),
('Albury', 'NSW'),
('Launceston', 'TAS'),
('Mackay', 'QLD')
ON CONFLICT (name) DO NOTHING;

-- Insert sample assessment questions
INSERT INTO assessment_questions (question_text, question_type, category, options, weight, is_required) VALUES
('Rate the overall condition of the property', 'rating', 'Property Condition', '["1", "2", "3", "4", "5"]', 2.0, true),
('What type of damage is present?', 'multiple_choice', 'Damage Assessment', '["Water damage", "Fire damage", "Structural damage", "Cosmetic damage", "Multiple types"]', 1.5, true),
('Is the damage consistent with the reported cause?', 'boolean', 'Cause Analysis', '["Yes", "No"]', 2.0, true),
('Describe the extent of damage in detail', 'text', 'Damage Assessment', '[]', 1.0, true),
('Are there any safety concerns?', 'boolean', 'Safety', '["Yes", "No"]', 3.0, true),
('Rate the quality of property maintenance', 'rating', 'Property Condition', '["1", "2", "3", "4", "5"]', 1.5, true),
('What is the estimated repair timeframe?', 'multiple_choice', 'Repair Planning', '["1-2 weeks", "3-4 weeks", "1-2 months", "3+ months"]', 1.0, false),
('Additional observations or recommendations', 'text', 'General', '[]', 0.5, false)
ON CONFLICT (question_text) DO NOTHING;