/*
  # Seed Production Data

  1. Reference Data
    - Industries
    - Skills
    - Locations
    - Assessment Questions

  2. Sample Companies and Users
    - Multiple companies with different roles
    - Realistic user profiles

  3. Sample Jobs and Assessments
    - 25+ diverse job postings
    - Completed assessments for testing
*/

-- Insert Industries
INSERT INTO industries (id, name, description) VALUES
  (gen_random_uuid(), 'Insurance', 'Property and casualty insurance services'),
  (gen_random_uuid(), 'Construction', 'Building and construction services'),
  (gen_random_uuid(), 'Real Estate', 'Property management and real estate services'),
  (gen_random_uuid(), 'Legal', 'Legal and compliance services'),
  (gen_random_uuid(), 'Engineering', 'Engineering and technical services'),
  (gen_random_uuid(), 'Finance', 'Financial and accounting services')
ON CONFLICT (name) DO NOTHING;

-- Insert Skills
INSERT INTO skills (id, name, category, description) VALUES
  (gen_random_uuid(), 'Property Assessment', 'Technical', 'Ability to assess property damage and value'),
  (gen_random_uuid(), 'Insurance Knowledge', 'Domain', 'Understanding of insurance policies and procedures'),
  (gen_random_uuid(), 'Report Writing', 'Communication', 'Professional report writing and documentation'),
  (gen_random_uuid(), 'Photography', 'Technical', 'Evidence photography and documentation'),
  (gen_random_uuid(), 'Customer Service', 'Interpersonal', 'Professional customer interaction'),
  (gen_random_uuid(), 'Risk Assessment', 'Analytical', 'Identifying and evaluating risks'),
  (gen_random_uuid(), 'Building Construction', 'Technical', 'Understanding of building materials and methods'),
  (gen_random_uuid(), 'Water Damage Assessment', 'Specialized', 'Expertise in water damage evaluation'),
  (gen_random_uuid(), 'Fire Damage Assessment', 'Specialized', 'Expertise in fire damage evaluation'),
  (gen_random_uuid(), 'Storm Damage Assessment', 'Specialized', 'Expertise in weather-related damage'),
  (gen_random_uuid(), 'Cost Estimation', 'Financial', 'Accurate repair and replacement cost estimation'),
  (gen_random_uuid(), 'Legal Compliance', 'Regulatory', 'Understanding of legal and regulatory requirements')
ON CONFLICT (name) DO NOTHING;

-- Insert Locations
INSERT INTO locations (id, city, state, postal_code, latitude, longitude) VALUES
  (gen_random_uuid(), 'Sydney', 'NSW', '2000', -33.8688, 151.2093),
  (gen_random_uuid(), 'Melbourne', 'VIC', '3000', -37.8136, 144.9631),
  (gen_random_uuid(), 'Brisbane', 'QLD', '4000', -27.4698, 153.0251),
  (gen_random_uuid(), 'Perth', 'WA', '6000', -31.9505, 115.8605),
  (gen_random_uuid(), 'Adelaide', 'SA', '5000', -34.9285, 138.6007),
  (gen_random_uuid(), 'Canberra', 'ACT', '2600', -35.2809, 149.1300),
  (gen_random_uuid(), 'Darwin', 'NT', '0800', -12.4634, 130.8456),
  (gen_random_uuid(), 'Hobart', 'TAS', '7000', -42.8821, 147.3272),
  (gen_random_uuid(), 'Gold Coast', 'QLD', '4217', -28.0167, 153.4000),
  (gen_random_uuid(), 'Newcastle', 'NSW', '2300', -32.9283, 151.7817)
ON CONFLICT (city, state) DO NOTHING;

-- Insert Assessment Questions
INSERT INTO assessment_questions (id, question_text, question_type, options, category, weight, is_required) VALUES
  (gen_random_uuid(), 'Rate the overall severity of the damage', 'rating', '["1", "2", "3", "4", "5"]', 'Damage Assessment', 2.0, true),
  (gen_random_uuid(), 'Is the property structurally sound?', 'boolean', '["Yes", "No"]', 'Safety', 3.0, true),
  (gen_random_uuid(), 'What is the primary cause of damage?', 'multiple_choice', '["Storm", "Fire", "Water", "Impact", "Other"]', 'Cause Analysis', 2.0, true),
  (gen_random_uuid(), 'Describe the extent of damage in detail', 'text', '[]', 'Documentation', 1.5, true),
  (gen_random_uuid(), 'Are there any safety hazards present?', 'boolean', '["Yes", "No"]', 'Safety', 3.0, true),
  (gen_random_uuid(), 'Rate the quality of property maintenance', 'rating', '["1", "2", "3", "4", "5"]', 'Maintenance', 1.5, false),
  (gen_random_uuid(), 'Is immediate action required?', 'boolean', '["Yes", "No"]', 'Urgency', 2.5, true),
  (gen_random_uuid(), 'What materials are primarily affected?', 'multiple_choice', '["Timber", "Brick", "Concrete", "Metal", "Other"]', 'Materials', 1.0, false)
ON CONFLICT DO NOTHING;

-- Insert Sample Companies
DO $$
DECLARE
    company1_id uuid := gen_random_uuid();
    company2_id uuid := gen_random_uuid();
    company3_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO companies (id, company_name, abn, address, phone, email, industry, job_reminder_threshold_hours, assessment_overdue_threshold_hours, max_assessments_per_day) VALUES
      (company1_id, 'RapidAssess Insurance Services', '12 345 678 901', '123 Business Street, Sydney NSW 2000', '+61 2 9876 5432', 'contact@rapidassess.com', 'Insurance', 24, 48, 5),
      (company2_id, 'Premier Assessment Group', '23 456 789 012', '456 Collins Street, Melbourne VIC 3000', '+61 3 8765 4321', 'info@premierassess.com.au', 'Insurance', 12, 24, 8),
      (company3_id, 'National Property Assessors', '34 567 890 123', '789 Queen Street, Brisbane QLD 4000', '+61 7 7654 3210', 'admin@nationalassess.com.au', 'Insurance', 36, 72, 3);

    -- Insert Sample Users with proper password hashing (in production, use proper bcrypt)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_role, company_id, is_assessor, base_location) VALUES
      -- Company 1 Users
      (gen_random_uuid(), 'admin@rapidassess.com', crypt('admin123', gen_salt('bf')), 'John Admin', '+61 412 345 678', 'platform_admin', company1_id, true, 'Sydney CBD, NSW'),
      (gen_random_uuid(), 'manager@rapidassess.com', crypt('manager123', gen_salt('bf')), 'Sarah Manager', '+61 423 456 789', 'company_admin', company1_id, true, 'Sydney CBD, NSW'),
      (gen_random_uuid(), 'assessor1@rapidassess.com', crypt('assessor123', gen_salt('bf')), 'Mike Assessor', '+61 434 567 890', 'assessor', company1_id, true, 'Sydney CBD, NSW'),
      (gen_random_uuid(), 'assessor2@rapidassess.com', crypt('assessor123', gen_salt('bf')), 'Lisa Chen', '+61 445 678 901', 'assessor', company1_id, true, 'Parramatta, NSW'),
      (gen_random_uuid(), 'assessor3@rapidassess.com', crypt('assessor123', gen_salt('bf')), 'David Wilson', '+61 456 789 012', 'assessor', company1_id, true, 'Bondi, NSW'),
      
      -- Company 2 Users
      (gen_random_uuid(), 'admin@premierassess.com.au', crypt('admin123', gen_salt('bf')), 'Emma Thompson', '+61 467 890 123', 'company_admin', company2_id, true, 'Melbourne CBD, VIC'),
      (gen_random_uuid(), 'assessor1@premierassess.com.au', crypt('assessor123', gen_salt('bf')), 'James Rodriguez', '+61 478 901 234', 'assessor', company2_id, true, 'Melbourne CBD, VIC'),
      (gen_random_uuid(), 'assessor2@premierassess.com.au', crypt('assessor123', gen_salt('bf')), 'Sophie Martinez', '+61 489 012 345', 'assessor', company2_id, true, 'Richmond, VIC'),
      
      -- Company 3 Users
      (gen_random_uuid(), 'admin@nationalassess.com.au', crypt('admin123', gen_salt('bf')), 'Robert Taylor', '+61 490 123 456', 'company_admin', company3_id, true, 'Brisbane CBD, QLD'),
      (gen_random_uuid(), 'assessor1@nationalassess.com.au', crypt('assessor123', gen_salt('bf')), 'Michelle Garcia', '+61 401 234 567', 'assessor', company3_id, true, 'Brisbane CBD, QLD');
END $$;

-- Insert Sample PDS Documents
INSERT INTO pds_documents (id, name, insurer, version, effective_date, file_uri, uploaded_by) VALUES
  (gen_random_uuid(), 'Home Insurance PDS 2024', 'Global Insurance Co', '2.1', '2024-01-01', 'pds-documents/home-insurance-2024.pdf', (SELECT id FROM users WHERE email = 'admin@rapidassess.com' LIMIT 1)),
  (gen_random_uuid(), 'Commercial Property PDS 2024', 'Premier Insurance Ltd', '1.8', '2024-01-01', 'pds-documents/commercial-property-2024.pdf', (SELECT id FROM users WHERE email = 'admin@rapidassess.com' LIMIT 1)),
  (gen_random_uuid(), 'Strata Insurance PDS 2024', 'National Insurance Corp', '3.2', '2024-01-01', 'pds-documents/strata-insurance-2024.pdf', (SELECT id FROM users WHERE email = 'admin@rapidassess.com' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert Sample Jobs (25+ diverse jobs)
DO $$
DECLARE
    company1_id uuid := (SELECT id FROM companies WHERE company_name = 'RapidAssess Insurance Services');
    company2_id uuid := (SELECT id FROM companies WHERE company_name = 'Premier Assessment Group');
    company3_id uuid := (SELECT id FROM companies WHERE company_name = 'National Property Assessors');
    assessor1_id uuid := (SELECT id FROM users WHERE email = 'assessor1@rapidassess.com');
    assessor2_id uuid := (SELECT id FROM users WHERE email = 'assessor2@rapidassess.com');
    assessor3_id uuid := (SELECT id FROM users WHERE email = 'assessor3@rapidassess.com');
    pds1_id uuid := (SELECT id FROM pds_documents WHERE name = 'Home Insurance PDS 2024');
BEGIN
    INSERT INTO jobs (id, claim_number, customer_name, customer_phone, customer_email, property_address, event_type, date_of_loss, priority, status, insurer, policy_number, notes, company_id, assigned_to, time_assigned, appointment_date, pds_document_id) VALUES
      -- Recent jobs requiring action
      (gen_random_uuid(), 'CLM-2025-001', 'Emma Thompson', '+61 412 123 456', 'emma.thompson@email.com', '45 Ocean View Drive, Bondi Beach NSW 2026', 'storm', '2025-01-15', 'high', 'awaiting_booking', 'Global Insurance Co', 'POL-123456789', 'Roof damage from fallen tree during storm', company1_id, assessor1_id, now() - interval '2 hours', null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-002', 'David Wilson', '+61 423 234 567', 'david.wilson@email.com', '78 Harbour Street, Circular Quay NSW 2000', 'escape_of_liquid', '2025-01-14', 'urgent', 'awaiting_attendance', 'Premium Insurance Ltd', 'POL-987654321', 'Burst pipe causing water damage', company1_id, assessor2_id, now() - interval '1 day', now() + interval '2 hours', pds1_id),
      (gen_random_uuid(), 'CLM-2025-003', 'Lisa Chen', '+61 434 345 678', 'lisa.chen@email.com', '92 Park Avenue, Surry Hills NSW 2010', 'fire', '2025-01-13', 'medium', 'new_job', 'Secure Insurance Group', 'POL-456789123', 'Kitchen fire damage', company1_id, null, null, null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-004', 'Michael Rodriguez', '+61 445 567 890', 'michael.rodriguez@email.com', '156 Collins Street, Melbourne VIC 3000', 'storm', '2025-01-16', 'urgent', 'awaiting_booking', 'Australian Insurance Group', 'POL-789123456', 'Hail damage to roof and windows', company2_id, (SELECT id FROM users WHERE email = 'assessor1@premierassess.com.au'), now() - interval '3 hours', null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-005', 'Sarah Mitchell', '+61 456 678 901', 'sarah.mitchell@email.com', '23 Queen Street, Brisbane QLD 4000', 'impact', '2025-01-15', 'high', 'awaiting_attendance', 'National Insurance Corp', 'POL-345678912', 'Vehicle impact damage to front fence', company3_id, (SELECT id FROM users WHERE email = 'assessor1@nationalassess.com.au'), now() - interval '1 day', now() + interval '4 hours', pds1_id),
      
      -- Jobs in various stages
      (gen_random_uuid(), 'CLM-2025-006', 'James Patterson', '+61 467 789 012', 'james.patterson@email.com', '89 Chapel Street, South Yarra VIC 3141', 'escape_of_liquid', '2025-01-12', 'medium', 'assessed', 'Elite Insurance Services', 'POL-567891234', 'Bathroom leak causing ceiling damage', company2_id, (SELECT id FROM users WHERE email = 'assessor2@premierassess.com.au'), now() - interval '3 days', now() - interval '1 day', pds1_id),
      (gen_random_uuid(), 'CLM-2025-007', 'Rebecca Foster', '+61 478 890 123', 'rebecca.foster@email.com', '67 Flinders Street, Adelaide SA 5000', 'fire', '2025-01-11', 'urgent', 'completed', 'Premier Insurance Ltd', 'POL-678912345', 'Electrical fire in garage', company1_id, assessor3_id, now() - interval '4 days', now() - interval '2 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-008', 'Anthony Kumar', '+61 489 901 234', 'anthony.kumar@email.com', '134 Hay Street, Perth WA 6000', 'storm', '2025-01-10', 'low', 'pending_completion', 'Western Insurance Co', 'POL-789123456', 'Minor roof tile damage from wind', company1_id, assessor1_id, now() - interval '5 days', now() - interval '3 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-009', 'Nicole Anderson', '+61 490 012 345', 'nicole.anderson@email.com', '45 George Street, Sydney NSW 2000', 'impact', '2025-01-09', 'high', 'awaiting_insurer', 'City Insurance Group', 'POL-890123456', 'Tree branch fell on carport', company1_id, assessor2_id, now() - interval '6 days', now() - interval '4 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-010', 'Robert Taylor', '+61 401 123 456', 'robert.taylor@email.com', '78 King William Street, Adelaide SA 5000', 'escape_of_liquid', '2025-01-08', 'medium', 'on_hold', 'Southern Insurance Ltd', 'POL-901234567', 'Hot water system leak', company3_id, (SELECT id FROM users WHERE email = 'assessor1@nationalassess.com.au'), now() - interval '7 days', now() - interval '5 days', pds1_id),
      
      -- Additional diverse jobs
      (gen_random_uuid(), 'CLM-2025-011', 'Amanda White', '+61 412 234 567', 'amanda.white@email.com', '92 Swanston Street, Melbourne VIC 3000', 'fire', '2025-01-07', 'urgent', 'completed', 'Metro Insurance Group', 'POL-012345678', 'Kitchen fire with smoke damage', company2_id, (SELECT id FROM users WHERE email = 'assessor1@premierassess.com.au'), now() - interval '8 days', now() - interval '6 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-012', 'Daniel Brown', '+61 423 345 678', 'daniel.brown@email.com', '156 Pitt Street, Sydney NSW 2000', 'storm', '2025-01-06', 'low', 'new_job', 'Harbour Insurance Co', 'POL-123456780', 'Minor gutter damage from storm', company1_id, null, null, null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-013', 'Jennifer Lee', '+61 434 456 789', 'jennifer.lee@email.com', '234 Brunswick Street, Fitzroy VIC 3065', 'impact', '2025-01-05', 'high', 'awaiting_attendance', 'Northern Insurance Group', 'POL-234567891', 'Delivery truck damaged front wall', company2_id, (SELECT id FROM users WHERE email = 'assessor2@premierassess.com.au'), now() - interval '9 days', now() + interval '1 day', pds1_id),
      (gen_random_uuid(), 'CLM-2025-014', 'Christopher Davis', '+61 445 567 890', 'christopher.davis@email.com', '67 Oxford Street, Paddington NSW 2021', 'escape_of_liquid', '2025-01-04', 'medium', 'awaiting_booking', 'Eastern Insurance Ltd', 'POL-345678902', 'Washing machine overflow', company1_id, assessor3_id, now() - interval '10 days', null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-015', 'Michelle Garcia', '+61 456 678 901', 'michelle.garcia@email.com', '89 Rundle Mall, Adelaide SA 5000', 'fire', '2025-01-03', 'urgent', 'assessed', 'Central Insurance Co', 'POL-456789013', 'Electrical fault caused office fire', company3_id, (SELECT id FROM users WHERE email = 'assessor1@nationalassess.com.au'), now() - interval '11 days', now() - interval '9 days', pds1_id),
      
      -- More jobs for comprehensive testing
      (gen_random_uuid(), 'CLM-2025-016', 'Kevin Thompson', '+61 467 789 012', 'kevin.thompson@email.com', '145 William Street, Perth WA 6000', 'storm', '2025-01-02', 'low', 'completed', 'Pacific Insurance Group', 'POL-567890124', 'Fence panels blown down', company1_id, assessor1_id, now() - interval '12 days', now() - interval '10 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-017', 'Laura Wilson', '+61 478 890 123', 'laura.wilson@email.com', '78 Bourke Street, Melbourne VIC 3000', 'impact', '2025-01-01', 'high', 'pending_completion', 'Victoria Insurance Corp', 'POL-678901235', 'Scaffolding collapse damaged facade', company2_id, (SELECT id FROM users WHERE email = 'assessor1@premierassess.com.au'), now() - interval '13 days', now() - interval '11 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-018', 'Mark Johnson', '+61 489 901 234', 'mark.johnson@email.com', '234 Elizabeth Street, Brisbane QLD 4000', 'escape_of_liquid', '2024-12-30', 'medium', 'awaiting_booking', 'Queensland Insurance Ltd', 'POL-789012346', 'Dishwasher malfunction flooding', company3_id, (SELECT id FROM users WHERE email = 'assessor1@nationalassess.com.au'), now() - interval '14 days', null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-019', 'Stephanie Clark', '+61 490 012 345', 'stephanie.clark@email.com', '56 Hunter Street, Newcastle NSW 2300', 'storm', '2024-12-29', 'urgent', 'new_job', 'Hunter Valley Insurance', 'POL-890123457', 'Severe hail damage to roof and solar panels', company1_id, null, null, null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-020', 'Thomas Martinez', '+61 401 234 567', 'thomas.martinez@email.com', '123 Lonsdale Street, Melbourne VIC 3000', 'fire', '2024-12-28', 'high', 'awaiting_attendance', 'Melbourne Insurance Group', 'POL-901234568', 'Apartment fire from faulty heater', company2_id, (SELECT id FROM users WHERE email = 'assessor2@premierassess.com.au'), now() - interval '15 days', now() + interval '6 hours', pds1_id),
      
      -- Additional jobs for robust testing
      (gen_random_uuid(), 'CLM-2025-021', 'Patricia Moore', '+61 412 345 789', 'patricia.moore@email.com', '67 King Street, Sydney NSW 2000', 'storm', '2024-12-27', 'medium', 'assessed', 'Harbour Insurance Co', 'POL-012345679', 'Window damage from flying debris', company1_id, assessor1_id, now() - interval '16 days', now() - interval '14 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-022', 'Andrew Jackson', '+61 423 456 890', 'andrew.jackson@email.com', '89 Little Collins Street, Melbourne VIC 3000', 'escape_of_liquid', '2024-12-26', 'high', 'completed', 'Metro Insurance Group', 'POL-123456790', 'Burst pipe in apartment complex', company2_id, (SELECT id FROM users WHERE email = 'assessor1@premierassess.com.au'), now() - interval '17 days', now() - interval '15 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-023', 'Rachel Green', '+61 434 567 901', 'rachel.green@email.com', '45 Adelaide Street, Brisbane QLD 4000', 'fire', '2024-12-25', 'urgent', 'awaiting_insurer', 'Queensland Insurance Ltd', 'POL-234567890', 'Christmas Day electrical fire', company3_id, (SELECT id FROM users WHERE email = 'assessor1@nationalassess.com.au'), now() - interval '18 days', now() - interval '16 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-024', 'Steven Wright', '+61 445 678 012', 'steven.wright@email.com', '123 Murray Street, Perth WA 6000', 'impact', '2024-12-24', 'medium', 'on_hold', 'Western Insurance Co', 'POL-345678901', 'Hail damage to commercial building', company1_id, assessor2_id, now() - interval '19 days', now() - interval '17 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-025', 'Helen Davis', '+61 456 789 123', 'helen.davis@email.com', '67 Rundle Street, Adelaide SA 5000', 'storm', '2024-12-23', 'low', 'completed', 'Southern Insurance Ltd', 'POL-456789012', 'Minor roof damage from wind', company3_id, (SELECT id FROM users WHERE email = 'assessor1@nationalassess.com.au'), now() - interval '20 days', now() - interval '18 days', pds1_id),
      
      -- More diverse scenarios
      (gen_random_uuid(), 'CLM-2025-026', 'Brian Miller', '+61 467 890 234', 'brian.miller@email.com', '89 Flinders Lane, Melbourne VIC 3000', 'escape_of_liquid', '2024-12-22', 'high', 'awaiting_booking', 'Victoria Insurance Corp', 'POL-567890123', 'Sprinkler system malfunction in office', company2_id, (SELECT id FROM users WHERE email = 'assessor1@premierassess.com.au'), now() - interval '21 days', null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-027', 'Catherine Lee', '+61 478 901 345', 'catherine.lee@email.com', '234 George Street, Sydney NSW 2000', 'fire', '2024-12-21', 'medium', 'new_job', 'City Insurance Group', 'POL-678901234', 'Balcony BBQ fire spread to apartment', company1_id, null, null, null, pds1_id),
      (gen_random_uuid(), 'CLM-2025-028', 'Paul Anderson', '+61 489 012 456', 'paul.anderson@email.com', '45 Creek Street, Brisbane QLD 4000', 'storm', '2024-12-20', 'urgent', 'assessed', 'Queensland Insurance Ltd', 'POL-789012345', 'Cyclone damage to commercial property', company3_id, (SELECT id FROM users WHERE email = 'assessor1@nationalassess.com.au'), now() - interval '22 days', now() - interval '20 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-029', 'Diana Ross', '+61 490 123 567', 'diana.ross@email.com', '67 St Kilda Road, Melbourne VIC 3004', 'impact', '2024-12-19', 'high', 'pending_completion', 'Metro Insurance Group', 'POL-890123456', 'Crane collapse damaged building', company2_id, (SELECT id FROM users WHERE email = 'assessor2@premierassess.com.au'), now() - interval '23 days', now() - interval '21 days', pds1_id),
      (gen_random_uuid(), 'CLM-2025-030', 'Gary Wilson', '+61 401 234 678', 'gary.wilson@email.com', '123 Hindley Street, Adelaide SA 5000', 'escape_of_liquid', '2024-12-18', 'low', 'completed', 'Southern Insurance Ltd', 'POL-901234567', 'Roof leak during heavy rain', company3_id, (SELECT id FROM users WHERE email = 'assessor1@nationalassess.com.au'), now() - interval '24 days', now() - interval '22 days', pds1_id);
END $$;

-- Insert User Skills (sample skill assignments)
DO $$
DECLARE
    property_skill_id uuid := (SELECT id FROM skills WHERE name = 'Property Assessment');
    insurance_skill_id uuid := (SELECT id FROM skills WHERE name = 'Insurance Knowledge');
    report_skill_id uuid := (SELECT id FROM skills WHERE name = 'Report Writing');
    photo_skill_id uuid := (SELECT id FROM skills WHERE name = 'Photography');
    water_skill_id uuid := (SELECT id FROM skills WHERE name = 'Water Damage Assessment');
    fire_skill_id uuid := (SELECT id FROM skills WHERE name = 'Fire Damage Assessment');
    storm_skill_id uuid := (SELECT id FROM skills WHERE name = 'Storm Damage Assessment');
BEGIN
    -- Assign skills to assessors with varying proficiency levels
    INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_experience) 
    SELECT u.id, property_skill_id, 
           CASE 
             WHEN u.email LIKE '%admin%' THEN 5
             WHEN u.email LIKE '%assessor1%' THEN 4
             WHEN u.email LIKE '%assessor2%' THEN 3
             ELSE 3
           END,
           CASE 
             WHEN u.email LIKE '%admin%' THEN 10
             WHEN u.email LIKE '%assessor1%' THEN 7
             WHEN u.email LIKE '%assessor2%' THEN 4
             ELSE 3
           END
    FROM users u WHERE u.is_assessor = true;

    -- Add specialized skills
    INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_experience)
    SELECT u.id, water_skill_id, 4, 5
    FROM users u WHERE u.email = 'assessor1@rapidassess.com';

    INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_experience)
    SELECT u.id, fire_skill_id, 5, 8
    FROM users u WHERE u.email = 'assessor2@rapidassess.com';

    INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_experience)
    SELECT u.id, storm_skill_id, 4, 6
    FROM users u WHERE u.email = 'assessor3@rapidassess.com';
END $$;

-- Insert Sample Assessments
DO $$
DECLARE
    completed_job_id uuid;
    assessed_job_id uuid;
    assessor_id uuid;
BEGIN
    -- Get some completed/assessed jobs
    SELECT id INTO completed_job_id FROM jobs WHERE status = 'completed' LIMIT 1;
    SELECT id INTO assessed_job_id FROM jobs WHERE status = 'assessed' LIMIT 1;
    SELECT id INTO assessor_id FROM users WHERE is_assessor = true LIMIT 1;

    IF completed_job_id IS NOT NULL THEN
        INSERT INTO assessments (id, job_id, assessor_id, company_id, assessment_date, status, event_details, damage_areas, total_estimate) VALUES
          (gen_random_uuid(), completed_job_id, assessor_id, (SELECT company_id FROM jobs WHERE id = completed_job_id), now() - interval '2 days', 'completed', 
           '{"event_type": "fire", "damage_description": "Kitchen fire with smoke damage", "cause_description": "Electrical fault in oven", "owner_maintenance_status": "yes"}',
           '[{"area": "Kitchen", "damage_type": "Fire damage", "description": "Extensive fire damage to cabinetry and appliances", "photos": ["https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg"]}]',
           15750.00);
    END IF;

    IF assessed_job_id IS NOT NULL THEN
        INSERT INTO assessments (id, job_id, assessor_id, company_id, assessment_date, status, event_details, damage_areas, total_estimate) VALUES
          (gen_random_uuid(), assessed_job_id, assessor_id, (SELECT company_id FROM jobs WHERE id = assessed_job_id), now() - interval '1 day', 'completed',
           '{"event_type": "escape_of_liquid", "damage_description": "Water damage to ceiling and walls", "cause_description": "Burst pipe in bathroom", "owner_maintenance_status": "partial"}',
           '[{"area": "Bathroom", "damage_type": "Water damage", "description": "Water staining and damaged plaster", "photos": ["https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"]}]',
           3250.00);
    END IF;
END $$;