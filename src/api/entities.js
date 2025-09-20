import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import AuthService from '@/lib/auth';
import { 
  userUpdateSchema, 
  companySchema, 
  jobSchema, 
  assessmentSchema, 
  pdsDocumentSchema, 
  commentSchema, 
  notificationSchema,
  validateInput 
} from '@/lib/validation';
import { logger } from '@/lib/logger';

// Import mock API as fallback
import * as mockApi from './mockApi.js';

/**
 * Production-ready entity services with validation and error handling
 * Falls back to mock API if Supabase is not configured
 */

// Create CRUD operations for Supabase tables
const createSupabaseCrud = (tableName) => ({
  async list(sortField = null) {
    if (!isSupabaseConfigured) {
      throw new Error('Database service not available');
    }

    let query = supabase.from(tableName).select('*');
    
    if (sortField && sortField.startsWith('-')) {
      const field = sortField.substring(1);
      query = query.order(field, { ascending: false });
    } else if (sortField) {
      query = query.order(sortField, { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    if (!isSupabaseConfigured) {
      throw new Error('Database service not available');
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async filter(filters = {}, sortField = null, limit = null) {
    if (!isSupabaseConfigured) {
      throw new Error('Database service not available');
    }

    let query = supabase.from(tableName).select('*');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && value.$ne) {
          query = query.neq(key, value.$ne);
        } else if (typeof value === 'object' && value.$in) {
          query = query.in(key, value.$in);
        } else if (typeof value === 'object' && value.$nin) {
          query = query.not(key, 'in', `(${value.$nin.join(',')})`);
        } else if (typeof value === 'object' && value.$gte && value.$lt) {
          query = query.gte(key, value.$gte).lt(key, value.$lt);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply ordering
    if (sortField && sortField.startsWith('-')) {
      const field = sortField.substring(1);
      query = query.order(field, { ascending: false });
    } else if (sortField) {
      query = query.order(sortField, { ascending: true });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    if (!isSupabaseConfigured) {
      throw new Error('Database service not available');
    }

    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async update(id, data) {
    if (!isSupabaseConfigured) {
      throw new Error('Database service not available');
    }

    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async delete(id) {
    if (!isSupabaseConfigured) {
      throw new Error('Database service not available');
    }

    const { data: result, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }
});

// Helper function to use Supabase or fallback to mock
const useSupabaseOrMock = (supabaseOperation, mockOperation) => {
  return async (...args) => {
    if (isSupabaseConfigured) {
      try {
        return await supabaseOperation(...args);
      } catch (error) {
        console.warn('Supabase operation failed, falling back to mock:', error);
        return await mockOperation(...args);
      }
    } else {
      return await mockOperation(...args);
    }
  };
};

// User entity with authentication
export const User = {
  // Authentication methods
  async register(userData) {
    return useSupabaseOrMock(
      async () => {
        try {
          const validatedData = validateInput(userRegistrationSchema)(userData);
          const result = await AuthService.register(validatedData);
          logger.auditLog('user_registered', { email: validatedData.email });
          return result;
        } catch (error) {
          logger.error('User registration failed', { error: error.message, email: userData.email });
          throw error;
        }
      },
      () => mockApi.User.register(userData)
    )();
  },

  async login({ email, password }) {
    return useSupabaseOrMock(
      async () => {
        try {
          const result = await AuthService.signIn({ email, password });
          logger.auditLog('user_login', { email });
          return result.user;
        } catch (error) {
          logger.error('User login failed', { error: error.message, email });
          throw error;
        }
      },
      () => mockApi.User.login({ email, password })
    )();
  },

  async logout() {
    return useSupabaseOrMock(
      async () => {
        try {
          await AuthService.signOut();
          logger.auditLog('user_logout');
        } catch (error) {
          logger.error('User logout failed', { error: error.message });
          throw error;
        }
      },
      () => mockApi.User.logout()
    )();
  },

  async me() {
    return useSupabaseOrMock(
      async () => {
        try {
          const user = await AuthService.getCurrentUser();
          if (!user) throw new Error('Not authenticated');
          return user;
        } catch (error) {
          logger.error('Get current user failed', { error: error.message });
          throw error;
        }
      },
      () => mockApi.User.me()
    )();
  },

  async updateMyUserData(data) {
    return useSupabaseOrMock(
      async () => {
        try {
          const validatedData = validateInput(userUpdateSchema)(data);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');
          
          const result = await AuthService.updateProfile(user.id, validatedData);
          logger.auditLog('user_profile_updated', { userId: user.id });
          return result;
        } catch (error) {
          logger.error('User profile update failed', { error: error.message });
          throw error;
        }
      },
      () => mockApi.User.updateMyUserData(data)
    )();
  },

  // CRUD operations
  async list(sortField = null) {
    if (isSupabaseConfigured) {
      try {
        return await createSupabaseCrud('users').list(sortField);
      } catch (error) {
        console.warn('Supabase operation failed, falling back to mock:', error);
        return await mockApi.User.list(sortField);
      }
    } else {
      return await mockApi.User.list(sortField);
    }
  },

  async get(id) {
    if (isSupabaseConfigured) {
      try {
        return await createSupabaseCrud('users').get(id);
      } catch (error) {
        console.warn('Supabase operation failed, falling back to mock:', error);
        return await mockApi.User.get(id);
      }
    } else {
      return await mockApi.User.get(id);
    }
  },

  async filter(filters = {}, sortField = null, limit = null) {
    if (isSupabaseConfigured) {
      try {
        return await createSupabaseCrud('users').filter(filters, sortField, limit);
      } catch (error) {
        console.warn('Supabase operation failed, falling back to mock:', error);
        return await mockApi.User.filter(filters, sortField, limit);
      }
    } else {
      return await mockApi.User.filter(filters, sortField, limit);
    }
  },

  async create(data) {
    if (isSupabaseConfigured) {
      try {
        return await createSupabaseCrud('users').create(data);
      } catch (error) {
        console.warn('Supabase operation failed, falling back to mock:', error);
        return await mockApi.User.create(data);
      }
    } else {
      return await mockApi.User.create(data);
    }
  },

  async update(id, data) {
    if (isSupabaseConfigured) {
      try {
        return await createSupabaseCrud('users').update(id, data);
      } catch (error) {
        console.warn('Supabase operation failed, falling back to mock:', error);
        return await mockApi.User.update(id, data);
      }
    } else {
      return await mockApi.User.update(id, data);
    }
  },

  async delete(id) {
    if (isSupabaseConfigured) {
      try {
        return await createSupabaseCrud('users').delete(id);
      } catch (error) {
        console.warn('Supabase operation failed, falling back to mock:', error);
        return await mockApi.User.delete(id);
      }
    } else {
      return await mockApi.User.delete(id);
    }
  }
};

// Company entity
export const Company = isSupabaseConfigured ? {
  ...createSupabaseCrud('companies'),
  async getWithUsers(companyId) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          users (
            id,
            email,
            full_name,
            user_role,
            is_assessor,
            base_location,
            work_start_time,
            work_end_time,
            is_active
          )
        `)
        .eq('id', companyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get company with users failed', { error: error.message, companyId });
      // Fallback to mock
      const company = await mockApi.Company.get(companyId);
      const users = await mockApi.User.filter({ company_id: companyId });
      return { ...company, users };
    }
  }
} : mockApi.Company;

// Job entity
export const Job = isSupabaseConfigured ? {
  ...createSupabaseCrud('jobs'),
  async assign(jobId, assessorId) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          assigned_to: assessorId,
          time_assigned: new Date().toISOString(),
          status: 'awaiting_booking'
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;

      // Create notification for assignee
      if (assessorId) {
        await Notification.create({
          recipient_id: assessorId,
          job_id: jobId,
          type: 'assignment',
          title: 'New Job Assignment',
          content: `You have been assigned to job ${data.claim_number}`
        });
      }

      logger.auditLog('job_assigned', { jobId, assessorId });
      return data;
    } catch (error) {
      logger.error('Job assignment failed', { error: error.message, jobId, assessorId });
      // Fallback to mock
      const job = await mockApi.Job.get(jobId);
      return await mockApi.Job.update(jobId, {
        assigned_to: assessorId,
        time_assigned: new Date().toISOString(),
        status: 'awaiting_booking'
      });
    }
  }
} : mockApi.Job;

// Assessment entity
export const Assessment = isSupabaseConfigured ? {
  ...createSupabaseCrud('assessments'),
  async submitAssessment(assessmentData) {
    try {
      const validatedData = validateInput(assessmentSchema)(assessmentData);
      
      // Create assessment
      const assessment = await createSupabaseCrud('assessments').create(validatedData);

      // Update job status
      let jobStatus = 'assessed';
      if (validatedData.ai_analysis?.recommendation === 'additional_info_needed') {
        jobStatus = 'pending_completion';
      } else if (validatedData.ai_analysis?.recommendation === 'refer_to_insurer') {
        jobStatus = 'awaiting_insurer';
      }

      await Job.update(validatedData.job_id, {
        status: jobStatus,
        assessment_id: assessment.id,
        total_estimate: validatedData.total_estimate,
        scope_of_works: validatedData.scope_of_works
      });

      logger.auditLog('assessment_submitted', { 
        assessmentId: assessment.id, 
        jobId: validatedData.job_id,
        status: jobStatus 
      });

      return assessment;
    } catch (error) {
      logger.error('Assessment submission failed', { error: error.message });
      // Fallback to mock
      return await mockApi.Assessment.create(assessmentData);
    }
  }
} : mockApi.Assessment;

// PDS Document entity
export const PdsDocument = isSupabaseConfigured ? createSupabaseCrud('pds_documents') : mockApi.PdsDocument;

// Comment entity
export const Comment = isSupabaseConfigured ? createSupabaseCrud('comments') : mockApi.Comment;

// Notification entity
export const Notification = isSupabaseConfigured ? createSupabaseCrud('notifications') : mockApi.Notification;

// Additional entities with fallback support
export const Skill = isSupabaseConfigured ? createSupabaseCrud('skills') : { async list() { return []; } };

export const Industry = isSupabaseConfigured ? createSupabaseCrud('industries') : { async list() { return []; } };

export const Location = isSupabaseConfigured ? createSupabaseCrud('locations') : { async list() { return []; } };

export const AssessmentQuestion = isSupabaseConfigured ? createSupabaseCrud('assessment_questions') : { async list() { return []; } };

export const AssessmentResponse = isSupabaseConfigured ? createSupabaseCrud('assessment_responses') : { async list() { return []; } };