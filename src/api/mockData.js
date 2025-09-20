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
  },
  {
    id: 'job-4',
    claim_number: 'CLM-2024-004',
    customer_name: 'Michael Rodriguez',
    customer_phone: '+61 445 567 890',
    customer_email: 'michael.rodriguez@email.com',
    property_address: '156 Collins Street, Melbourne VIC 3000',
    event_type: 'storm',
    date_of_loss: '2024-01-17',
    priority: 'urgent',
    status: 'awaiting_booking',
    insurer: 'Australian Insurance Group',
    policy_number: 'POL-789123456',
    notes: 'Hail damage to roof and windows during severe storm',
    company_id: 'company-1',
    assigned_to: 'user-1',
    time_assigned: '2024-01-17T11:15:00Z',
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-17T10:00:00Z',
    updated_date: '2024-01-17T11:15:00Z'
  },
  {
    id: 'job-5',
    claim_number: 'CLM-2024-005',
    customer_name: 'Sarah Mitchell',
    customer_phone: '+61 456 678 901',
    customer_email: 'sarah.mitchell@email.com',
    property_address: '23 Queen Street, Brisbane QLD 4000',
    event_type: 'impact',
    date_of_loss: '2024-01-16',
    priority: 'high',
    status: 'awaiting_attendance',
    insurer: 'National Insurance Corp',
    policy_number: 'POL-345678912',
    notes: 'Vehicle impact damage to front fence and garden',
    company_id: 'company-1',
    assigned_to: 'user-3',
    time_assigned: '2024-01-16T14:20:00Z',
    appointment_date: '2024-01-19T10:30:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-16T13:45:00Z',
    updated_date: '2024-01-16T14:20:00Z'
  },
  {
    id: 'job-6',
    claim_number: 'CLM-2024-006',
    customer_name: 'James Patterson',
    customer_phone: '+61 467 789 012',
    customer_email: 'james.patterson@email.com',
    property_address: '89 Chapel Street, South Yarra VIC 3141',
    event_type: 'escape_of_liquid',
    date_of_loss: '2024-01-18',
    priority: 'medium',
    status: 'new_job',
    insurer: 'Elite Insurance Services',
    policy_number: 'POL-567891234',
    notes: 'Bathroom leak causing ceiling damage in unit below',
    company_id: 'company-1',
    assigned_to: null,
    time_assigned: null,
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-18T08:30:00Z',
    updated_date: '2024-01-18T08:30:00Z'
  },
  {
    id: 'job-7',
    claim_number: 'CLM-2024-007',
    customer_name: 'Rebecca Foster',
    customer_phone: '+61 478 890 123',
    customer_email: 'rebecca.foster@email.com',
    property_address: '67 Flinders Street, Adelaide SA 5000',
    event_type: 'fire',
    date_of_loss: '2024-01-12',
    priority: 'urgent',
    status: 'assessed',
    insurer: 'Premier Insurance Ltd',
    policy_number: 'POL-678912345',
    notes: 'Electrical fire in garage, smoke damage to house',
    company_id: 'company-1',
    assigned_to: 'user-2',
    time_assigned: '2024-01-13T09:00:00Z',
    appointment_date: '2024-01-15T13:00:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-12T16:30:00Z',
    updated_date: '2024-01-15T16:00:00Z'
  },
  {
    id: 'job-8',
    claim_number: 'CLM-2024-008',
    customer_name: 'Anthony Kumar',
    customer_phone: '+61 489 901 234',
    customer_email: 'anthony.kumar@email.com',
    property_address: '134 Hay Street, Perth WA 6000',
    event_type: 'storm',
    date_of_loss: '2024-01-19',
    priority: 'low',
    status: 'completed',
    insurer: 'Western Insurance Co',
    policy_number: 'POL-789123456',
    notes: 'Minor roof tile damage from wind',
    company_id: 'company-1',
    assigned_to: 'user-1',
    time_assigned: '2024-01-19T10:45:00Z',
    appointment_date: '2024-01-20T09:00:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-19T09:15:00Z',
    updated_date: '2024-01-21T15:30:00Z'
  },
  {
    id: 'job-9',
    claim_number: 'CLM-2024-009',
    customer_name: 'Nicole Anderson',
    customer_phone: '+61 490 012 345',
    customer_email: 'nicole.anderson@email.com',
    property_address: '45 George Street, Sydney NSW 2000',
    event_type: 'impact',
    date_of_loss: '2024-01-20',
    priority: 'high',
    status: 'awaiting_booking',
    insurer: 'City Insurance Group',
    policy_number: 'POL-890123456',
    notes: 'Tree branch fell on carport during storm',
    company_id: 'company-1',
    assigned_to: 'user-2',
    time_assigned: '2024-01-20T13:30:00Z',
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-20T12:00:00Z',
    updated_date: '2024-01-20T13:30:00Z'
  },
  {
    id: 'job-10',
    claim_number: 'CLM-2024-010',
    customer_name: 'Robert Taylor',
    customer_phone: '+61 401 123 456',
    customer_email: 'robert.taylor@email.com',
    property_address: '78 King William Street, Adelaide SA 5000',
    event_type: 'escape_of_liquid',
    date_of_loss: '2024-01-21',
    priority: 'medium',
    status: 'pending_completion',
    insurer: 'Southern Insurance Ltd',
    policy_number: 'POL-901234567',
    notes: 'Hot water system leak causing floor damage',
    company_id: 'company-1',
    assigned_to: 'user-3',
    time_assigned: '2024-01-21T08:45:00Z',
    appointment_date: '2024-01-22T11:00:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-21T08:00:00Z',
    updated_date: '2024-01-22T14:30:00Z'
  },
  {
    id: 'job-11',
    claim_number: 'CLM-2024-011',
    customer_name: 'Amanda White',
    customer_phone: '+61 412 234 567',
    customer_email: 'amanda.white@email.com',
    property_address: '92 Swanston Street, Melbourne VIC 3000',
    event_type: 'fire',
    date_of_loss: '2024-01-22',
    priority: 'urgent',
    status: 'awaiting_insurer',
    insurer: 'Metro Insurance Group',
    policy_number: 'POL-012345678',
    notes: 'Kitchen fire with extensive smoke damage throughout house',
    company_id: 'company-1',
    assigned_to: 'user-1',
    time_assigned: '2024-01-22T09:30:00Z',
    appointment_date: '2024-01-23T14:00:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-22T08:15:00Z',
    updated_date: '2024-01-24T10:45:00Z'
  },
  {
    id: 'job-12',
    claim_number: 'CLM-2024-012',
    customer_name: 'Daniel Brown',
    customer_phone: '+61 423 345 678',
    customer_email: 'daniel.brown@email.com',
    property_address: '156 Pitt Street, Sydney NSW 2000',
    event_type: 'storm',
    date_of_loss: '2024-01-23',
    priority: 'low',
    status: 'new_job',
    insurer: 'Harbour Insurance Co',
    policy_number: 'POL-123456780',
    notes: 'Minor gutter damage from recent storm',
    company_id: 'company-1',
    assigned_to: null,
    time_assigned: null,
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-23T15:20:00Z',
    updated_date: '2024-01-23T15:20:00Z'
  },
  {
    id: 'job-13',
    claim_number: 'CLM-2024-013',
    customer_name: 'Jennifer Lee',
    customer_phone: '+61 434 456 789',
    customer_email: 'jennifer.lee@email.com',
    property_address: '234 Brunswick Street, Fitzroy VIC 3065',
    event_type: 'impact',
    date_of_loss: '2024-01-24',
    priority: 'high',
    status: 'awaiting_attendance',
    insurer: 'Northern Insurance Group',
    policy_number: 'POL-234567891',
    notes: 'Delivery truck damaged front wall and entrance',
    company_id: 'company-1',
    assigned_to: 'user-3',
    time_assigned: '2024-01-24T11:00:00Z',
    appointment_date: '2024-01-25T15:30:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-24T10:30:00Z',
    updated_date: '2024-01-24T11:00:00Z'
  },
  {
    id: 'job-14',
    claim_number: 'CLM-2024-014',
    customer_name: 'Christopher Davis',
    customer_phone: '+61 445 567 890',
    customer_email: 'christopher.davis@email.com',
    property_address: '67 Oxford Street, Paddington NSW 2021',
    event_type: 'escape_of_liquid',
    date_of_loss: '2024-01-25',
    priority: 'medium',
    status: 'awaiting_booking',
    insurer: 'Eastern Insurance Ltd',
    policy_number: 'POL-345678902',
    notes: 'Washing machine overflow causing floor damage',
    company_id: 'company-1',
    assigned_to: 'user-2',
    time_assigned: '2024-01-25T14:15:00Z',
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-25T13:45:00Z',
    updated_date: '2024-01-25T14:15:00Z'
  },
  {
    id: 'job-15',
    claim_number: 'CLM-2024-015',
    customer_name: 'Michelle Garcia',
    customer_phone: '+61 456 678 901',
    customer_email: 'michelle.garcia@email.com',
    property_address: '89 Rundle Mall, Adelaide SA 5000',
    event_type: 'fire',
    date_of_loss: '2024-01-26',
    priority: 'urgent',
    status: 'on_hold',
    insurer: 'Central Insurance Co',
    policy_number: 'POL-456789013',
    notes: 'Electrical fault caused fire in office space - investigation ongoing',
    company_id: 'company-1',
    assigned_to: 'user-1',
    time_assigned: '2024-01-26T09:45:00Z',
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-26T08:30:00Z',
    updated_date: '2024-01-26T16:20:00Z'
  },
  {
    id: 'job-16',
    claim_number: 'CLM-2024-016',
    customer_name: 'Kevin Thompson',
    customer_phone: '+61 467 789 012',
    customer_email: 'kevin.thompson@email.com',
    property_address: '145 William Street, Perth WA 6000',
    event_type: 'storm',
    date_of_loss: '2024-01-27',
    priority: 'low',
    status: 'awaiting_attendance',
    insurer: 'Pacific Insurance Group',
    policy_number: 'POL-567890124',
    notes: 'Fence panels blown down in windstorm',
    company_id: 'company-1',
    assigned_to: 'user-2',
    time_assigned: '2024-01-27T12:30:00Z',
    appointment_date: '2024-01-28T16:00:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-27T11:45:00Z',
    updated_date: '2024-01-27T12:30:00Z'
  },
  {
    id: 'job-17',
    claim_number: 'CLM-2024-017',
    customer_name: 'Laura Wilson',
    customer_phone: '+61 478 890 123',
    customer_email: 'laura.wilson@email.com',
    property_address: '78 Bourke Street, Melbourne VIC 3000',
    event_type: 'impact',
    date_of_loss: '2024-01-28',
    priority: 'high',
    status: 'completed',
    insurer: 'Victoria Insurance Corp',
    policy_number: 'POL-678901235',
    notes: 'Scaffolding collapse damaged building facade',
    company_id: 'company-1',
    assigned_to: 'user-3',
    time_assigned: '2024-01-28T10:00:00Z',
    appointment_date: '2024-01-29T09:30:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-28T09:15:00Z',
    updated_date: '2024-01-30T17:45:00Z'
  },
  {
    id: 'job-18',
    claim_number: 'CLM-2024-018',
    customer_name: 'Mark Johnson',
    customer_phone: '+61 489 901 234',
    customer_email: 'mark.johnson@email.com',
    property_address: '234 Elizabeth Street, Brisbane QLD 4000',
    event_type: 'escape_of_liquid',
    date_of_loss: '2024-01-29',
    priority: 'medium',
    status: 'awaiting_booking',
    insurer: 'Queensland Insurance Ltd',
    policy_number: 'POL-789012346',
    notes: 'Dishwasher malfunction caused kitchen flooding',
    company_id: 'company-1',
    assigned_to: 'user-1',
    time_assigned: '2024-01-29T15:20:00Z',
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-29T14:30:00Z',
    updated_date: '2024-01-29T15:20:00Z'
  },
  {
    id: 'job-19',
    claim_number: 'CLM-2024-019',
    customer_name: 'Stephanie Clark',
    customer_phone: '+61 490 012 345',
    customer_email: 'stephanie.clark@email.com',
    property_address: '56 Hunter Street, Newcastle NSW 2300',
    event_type: 'storm',
    date_of_loss: '2024-01-30',
    priority: 'urgent',
    status: 'new_job',
    insurer: 'Hunter Valley Insurance',
    policy_number: 'POL-890123457',
    notes: 'Severe hail damage to roof and solar panels',
    company_id: 'company-1',
    assigned_to: null,
    time_assigned: null,
    appointment_date: null,
    pds_document_id: 'pds-1',
    created_date: '2024-01-30T16:45:00Z',
    updated_date: '2024-01-30T16:45:00Z'
  },
  {
    id: 'job-20',
    claim_number: 'CLM-2024-020',
    customer_name: 'Thomas Martinez',
    customer_phone: '+61 401 234 567',
    customer_email: 'thomas.martinez@email.com',
    property_address: '123 Lonsdale Street, Melbourne VIC 3000',
    event_type: 'fire',
    date_of_loss: '2024-01-31',
    priority: 'high',
    status: 'awaiting_attendance',
    insurer: 'Melbourne Insurance Group',
    policy_number: 'POL-901234568',
    notes: 'Apartment fire caused by faulty heater',
    company_id: 'company-1',
    assigned_to: 'user-3',
    time_assigned: '2024-01-31T11:30:00Z',
    appointment_date: '2025-02-01T10:00:00Z',
    pds_document_id: 'pds-1',
    created_date: '2024-01-31T10:15:00Z',
    updated_date: '2024-01-31T11:30:00Z'
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
  },
  {
    id: 'assessment-2',
    job_id: 'job-7',
    assessor_id: 'user-2',
    assessment_date: '2024-01-15T13:00:00Z',
    status: 'completed',
    event_details: {
      event_type: 'fire',
      damage_description: 'Electrical fire in garage with smoke damage throughout house',
      cause_description: 'Faulty electrical wiring in garage caused fire to start',
      owner_maintenance_status: 'partial'
    },
    damage_areas: [
      {
        area: 'Garage',
        damage_type: 'Fire damage',
        description: 'Structural fire damage to garage walls and ceiling',
        photos: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg']
      },
      {
        area: 'Living Room',
        damage_type: 'Smoke damage',
        description: 'Heavy smoke staining on walls and ceiling',
        photos: ['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg']
      }
    ],
    photos: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg', 'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'],
    documents: [],
    ai_analysis: {
      recommendation: 'proceed',
      reasoning: 'Fire damage covered under policy, electrical fault not due to negligence',
      confidence_level: 'high'
    },
    scope_of_works: [
      {
        description: 'Garage Rebuild',
        quantity: 1,
        unit: 'each',
        rate: 25000,
        total: 25000
      },
      {
        description: 'Smoke Damage Cleaning',
        quantity: 120,
        unit: 'm2',
        rate: 45,
        total: 5400
      }
    ],
    total_estimate: 30400,
    created_date: '2024-01-15T16:00:00Z'
  },
  {
    id: 'assessment-3',
    job_id: 'job-8',
    assessor_id: 'user-1',
    assessment_date: '2024-01-20T09:00:00Z',
    status: 'completed',
    event_details: {
      event_type: 'storm',
      damage_description: 'Minor roof tile damage from high winds',
      cause_description: 'Strong winds during storm displaced several roof tiles',
      owner_maintenance_status: 'yes'
    },
    damage_areas: [
      {
        area: 'Roof',
        damage_type: 'Tile damage',
        description: '8 roof tiles cracked or displaced, minor water entry',
        photos: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg']
      }
    ],
    photos: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
    documents: [],
    ai_analysis: {
      recommendation: 'proceed',
      reasoning: 'Storm damage clearly covered under policy terms',
      confidence_level: 'high'
    },
    scope_of_works: [
      {
        description: 'Roof Tile Replacement',
        quantity: 8,
        unit: 'each',
        rate: 15,
        total: 120
      },
      {
        description: 'Minor Ceiling Repair',
        quantity: 2,
        unit: 'm2',
        rate: 85,
        total: 170
      }
    ],
    total_estimate: 290,
    created_date: '2024-01-21T15:30:00Z'
  },
  {
    id: 'assessment-4',
    job_id: 'job-17',
    assessor_id: 'user-3',
    assessment_date: '2024-01-29T09:30:00Z',
    status: 'completed',
    event_details: {
      event_type: 'impact',
      damage_description: 'Building facade damaged by scaffolding collapse',
      cause_description: 'Construction scaffolding collapsed during high winds',
      owner_maintenance_status: 'yes'
    },
    damage_areas: [
      {
        area: 'Front Wall',
        damage_type: 'Structural damage',
        description: 'Brick facade cracked and damaged, windows broken',
        photos: ['https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg']
      }
    ],
    photos: ['https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg'],
    documents: [],
    ai_analysis: {
      recommendation: 'proceed',
      reasoning: 'Impact damage from external source covered under policy',
      confidence_level: 'high'
    },
    scope_of_works: [
      {
        description: 'Brick Wall Repair',
        quantity: 25,
        unit: 'm2',
        rate: 180,
        total: 4500
      },
      {
        description: 'Window Replacement',
        quantity: 3,
        unit: 'each',
        rate: 850,
        total: 2550
      }
    ],
    total_estimate: 7050,
    created_date: '2024-01-30T17:45:00Z'
  },
  {
    id: 'assessment-5',
    job_id: 'job-10',
    assessor_id: 'user-3',
    assessment_date: '2024-01-22T11:00:00Z',
    status: 'pending_review',
    event_details: {
      event_type: 'escape_of_liquid',
      damage_description: 'Hot water system leak causing extensive floor damage',
      cause_description: 'Hot water system relief valve failed causing continuous leak',
      owner_maintenance_status: 'no'
    },
    damage_areas: [
      {
        area: 'Laundry',
        damage_type: 'Water damage',
        description: 'Timber flooring warped and damaged from prolonged water exposure',
        photos: ['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg']
      }
    ],
    photos: ['https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg'],
    documents: [],
    ai_analysis: {
      recommendation: 'additional_info_needed',
      reasoning: 'Poor maintenance history may affect coverage - requires insurer review',
      confidence_level: 'medium'
    },
    scope_of_works: [
      {
        description: 'Timber Flooring Replacement',
        quantity: 12,
        unit: 'm2',
        rate: 120,
        total: 1440
      }
    ],
    total_estimate: 1440,
    created_date: '2024-01-22T14:30:00Z'
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