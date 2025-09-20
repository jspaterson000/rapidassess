import { z } from 'zod';

/**
 * Production-ready validation schemas using Zod
 */

// User validation schemas
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  companyId: z.string().uuid().optional(),
  userRole: z.enum(['platform_admin', 'company_admin', 'manager', 'assessor', 'user']).default('user')
});

export const userUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  base_location: z.string().optional(),
  work_start_time: z.string().optional(),
  work_end_time: z.string().optional(),
  is_assessor: z.boolean().optional()
});

// Company validation schemas
export const companySchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  abn: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  job_reminder_threshold_hours: z.number().int().min(1).max(168).default(24),
  assessment_overdue_threshold_hours: z.number().int().min(1).max(336).default(48),
  max_assessments_per_day: z.number().int().min(1).max(20).default(5),
  break_time_minutes: z.number().int().min(0).max(120).default(30)
});

// Job validation schemas
export const jobSchema = z.object({
  claim_number: z.string().min(1, 'Claim number is required'),
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters'),
  customer_phone: z.string().optional(),
  customer_email: z.string().email().optional(),
  property_address: z.string().min(5, 'Property address must be at least 5 characters'),
  event_type: z.enum(['storm', 'fire', 'escape_of_liquid', 'impact', 'other']),
  date_of_loss: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  insurer: z.string().optional(),
  policy_number: z.string().optional(),
  notes: z.string().optional(),
  company_id: z.string().uuid('Invalid company ID'),
  pds_document_id: z.string().uuid().optional()
});

// Assessment validation schemas
export const assessmentSchema = z.object({
  job_id: z.string().uuid('Invalid job ID'),
  assessor_id: z.string().uuid('Invalid assessor ID'),
  company_id: z.string().uuid('Invalid company ID'),
  assessment_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  status: z.enum(['in_progress', 'completed', 'pending_review', 'archived']).default('in_progress'),
  event_details: z.object({
    event_type: z.enum(['storm', 'fire', 'escape_of_liquid', 'impact', 'other']).optional(),
    damage_description: z.string().optional(),
    cause_description: z.string().optional(),
    owner_maintenance_status: z.enum(['yes', 'partial', 'no']).optional(),
    pds_document_id: z.string().uuid().optional()
  }).default({}),
  damage_areas: z.array(z.object({
    area: z.string(),
    damage_type: z.string().optional(),
    description: z.string(),
    photos: z.array(z.string().url()).default([])
  })).default([]),
  photos: z.array(z.string().url()).default([]),
  documents: z.array(z.string().url()).default([]),
  scope_of_works: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    rate: z.number().positive(),
    total: z.number().positive()
  })).default([]),
  total_estimate: z.number().min(0).default(0),
  additional_notes: z.string().optional()
});

// PDS Document validation schema
export const pdsDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  insurer: z.string().min(1, 'Insurer name is required'),
  version: z.string().default('1.0'),
  effective_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  file_uri: z.string().min(1, 'File URI is required'),
  file_size: z.number().positive().optional(),
  content_type: z.string().optional()
});

// Comment validation schema
export const commentSchema = z.object({
  job_id: z.string().uuid('Invalid job ID'),
  author_id: z.string().uuid('Invalid author ID'),
  content: z.string().min(1, 'Comment content is required'),
  mentioned_user_ids: z.array(z.string().uuid()).default([]),
  is_internal: z.boolean().default(true)
});

// Notification validation schema
export const notificationSchema = z.object({
  recipient_id: z.string().uuid('Invalid recipient ID'),
  sender_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  assessment_id: z.string().uuid().optional(),
  comment_id: z.string().uuid().optional(),
  type: z.enum(['mention', 'assignment', 'reminder', 'system']),
  title: z.string().optional(),
  content: z.string().min(1, 'Notification content is required')
});

/**
 * Validation middleware for API endpoints
 */
export const validateInput = (schema) => {
  return (data) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
      }
      throw error;
    }
  };
};

/**
 * Sanitize input to prevent XSS and injection attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim() // Remove whitespace
    .slice(0, 10000); // Limit length
};

/**
 * Validate file uploads
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
  }

  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    throw new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
  }

  const isTypeAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });

  if (!isTypeAllowed) {
    throw new Error('File type not allowed');
  }

  return true;
};

export default DatabaseService;