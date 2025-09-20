// Mock data for the application
export const mockUsers = [
  {
    id: 'user-1',
    email: 'admin@rapidassess.com',
    password: 'admin123',
    full_name: 'John Admin',
    user_role: 'platform_admin',
    company_id: 'company-1',
    is_assessor: true,
    base_location: 'Sydney CBD, NSW',
    work_start_time: '08:00',
    work_end_time: '17:00',
    phone: '+61 412 345 678'
  },
  {
    id: 'user-2',
    email: 'manager@rapidassess.com',
    password: 'manager123',
    full_name: 'Sarah Manager',
    user_role: 'company_admin',
    company_id: 'company-1',
    is_assessor: true,
    base_location: 'Melbourne CBD, VIC',
    work_start_time: '08:30',
    work_end_time: '17:30',
    phone: '+61 423 456 789'
  },
  {
    id: 'user-3',
    email: 'assessor@rapidassess.com',
    password: 'assessor123',
    full_name: 'Mike Assessor',
    user_role: 'user',
    company_id: 'company-1',
    is_assessor: true,
    base_location: 'Brisbane CBD, QLD',
    work_start_time: '07:30',
    work_end_time: '16:30',
    phone: '+61 434 567 890'
  }
];

export const mockCompanies = [
  {
    id: 'company-1',
    company_name: 'RapidAssess Insurance Services',
    abn: '12 345 678 901',
    address: '123 Business Street, Sydney NSW 2000',
    phone: '+61 2 9876 5432',
    email: 'contact@rapidassess.com',
    job_reminder_threshold_hours: 24,
    assessment_overdue_threshold_hours: 48,
    max_assessments_per_day: 5,
    break_time_minutes: 30
  }
];

export const mockJobs = [
  {
    id: 'job-1',
    claim_number: 'CLM-2024-001',
    customer_name: 'Emma Thompson',
    customer_phone: '+61 412 123 456',
    customer_email: 'emma.thompson@email.com',
    property_address: '45 Ocean View Drive, Bondi Beach NSW 2026',
    event_type: 'storm',
    date_of_loss: '2024-01-15',
    priority: 'high',
    status: 'awaiting_booking',
    insurer: 'Global Insurance Co',
    policy_number: 'POL-123456789',
    notes: 'Roof damage from fallen tree during storm',
    company_id: 'company-1',
    assigned_to: 'user-3',
    time_assigned: '2024-01-16T09:00:00Z',
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-16T08:00:00Z',
    updated_date: '2024-01-16T09:00:00Z'
  },
  {
    id: 'job-2',
    claim_number: 'CLM-2024-002',
    customer_name: 'David Wilson',
    customer_phone: '+61 423 234 567',
    customer_email: 'david.wilson@email.com',
    property_address: '78 Harbour Street, Circular Quay NSW 2000',
    event_type: 'escape_of_liquid',
    date_of_loss: '2024-01-14',
    priority: 'urgent',
    status: 'awaiting_attendance',
    insurer: 'Premium Insurance Ltd',
    policy_number: 'POL-987654321',
    notes: 'Burst pipe causing water damage',
    company_id: 'company-1',
    assigned_to: 'user-2',
    time_assigned: '2024-01-15T10:30:00Z',
    appointment_date: '2024-01-18T14:00:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-15T08:30:00Z',
    updated_date: '2024-01-15T10:30:00Z'
  },
  {
    id: 'job-3',
    claim_number: 'CLM-2024-003',
    customer_name: 'Lisa Chen',
    customer_phone: '+61 434 345 678',
    customer_email: 'lisa.chen@email.com',
    property_address: '92 Park Avenue, Surry Hills NSW 2010',
    event_type: 'fire',
    date_of_loss: '2024-01-13',
    priority: 'medium',
    status: 'new_job',
    insurer: 'Secure Insurance Group',
    policy_number: 'POL-456789123',
    notes: 'Kitchen fire damage',
    company_id: 'company-1',
    assigned_to: null,
    time_assigned: null,
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-16T07:00:00Z',
    updated_date: '2024-01-16T07:00:00Z'
  }
];

export const mockAssessments = [
  {
    id: 'assessment-1',
    job_id: 'job-2',
    assessor_id: 'user-2',
    assessment_date: '2024-01-17T14:00:00Z',
    status: 'completed',
    event_details: {
      event_type: 'escape_of_liquid',
      damage_description: 'Water damage to kitchen and living room from burst pipe',
      cause_description: 'Old copper pipe burst due to age and water pressure',
      owner_maintenance_status: 'yes'
    },
    damage_areas: [
      {
        area: 'Kitchen',
        damage_type: 'Water damage',
        description: 'Water staining on ceiling and walls, damaged cabinetry',
        photos: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']
      }
    ],
    photos: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
    documents: [],
    ai_analysis: {
      recommendation: 'proceed',
      reasoning: 'Damage is consistent with covered peril and policy terms',
      confidence_level: 'high'
    },
    scope_of_works: [
      {
        description: 'Ceiling Plaster Repair',
        quantity: 15,
        unit: 'm2',
        rate: 85,
        total: 1275
      }
    ],
    total_estimate: 1275,
    created_date: '2024-01-17T14:00:00Z'
  }
];

export const mockComments = [];
export const mockNotifications = [];
export const mockPdsDocuments = [
  {
    id: 'pds-1',
    name: 'Home Insurance PDS 2024',
    insurer: 'Global Insurance Co',
    version: '2.1',
    effective_date: '2024-01-01',
    file_uri: 'mock://pds-document-1'
  }
];