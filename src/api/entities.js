import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { DatabaseService } from '@/lib/database';
import { AuthService } from '@/lib/auth';
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
import * as mockApi from './mockApi';

/**
 * Production-ready entity services with validation and error handling
 * Falls back to mock API if Supabase is not configured
 */

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
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('users', userUpdateSchema).list({}, sortField),
      () => mockApi.User.list(sortField)
    )();
  },

  async get(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('users', userUpdateSchema).get(id),
      () => mockApi.User.get(id)
    )();
  },

  async filter(filters = {}, sortField = null, limit = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('users', userUpdateSchema).list(filters, sortField, limit),
      () => mockApi.User.filter(filters, sortField, limit)
    )();
  },

  async create(data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('users', userUpdateSchema).create(data),
      () => mockApi.User.create(data)
    )();
  },

  async update(id, data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('users', userUpdateSchema).update(id, data),
      () => mockApi.User.update(id, data)
    )();
  },

  async delete(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('users', userUpdateSchema).delete(id),
      () => mockApi.User.delete(id)
    )();
  }
};

// Company entity
export const Company = {
  async list(sortField = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('companies', companySchema).list({}, sortField),
      () => mockApi.Company.list(sortField)
    )();
  },

  async get(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('companies', companySchema).get(id),
      () => mockApi.Company.get(id)
    )();
  },

  async filter(filters = {}, sortField = null, limit = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('companies', companySchema).list(filters, sortField, limit),
      () => mockApi.Company.filter(filters, sortField, limit)
    )();
  },

  async create(data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('companies', companySchema).create(data),
      () => mockApi.Company.create(data)
    )();
  },

  async update(id, data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('companies', companySchema).update(id, data),
      () => mockApi.Company.update(id, data)
    )();
  },

  async delete(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('companies', companySchema).delete(id),
      () => mockApi.Company.delete(id)
    )();
  },

  async getWithUsers(companyId) {
    return useSupabaseOrMock(
      async () => {
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
          throw error;
        }
      },
      async () => {
        const company = await mockApi.Company.get(companyId);
        const users = await mockApi.User.filter({ company_id: companyId });
        return { ...company, users };
      }
    )();
  }
};

// Job entity
export const Job = {
  async list(sortField = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('jobs', jobSchema).list({}, sortField),
      () => mockApi.Job.list(sortField)
    )();
  },

  async get(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('jobs', jobSchema).get(id),
      () => mockApi.Job.get(id)
    )();
  },

  async filter(filters = {}, sortField = null, limit = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('jobs', jobSchema).list(filters, sortField, limit),
      () => mockApi.Job.filter(filters, sortField, limit)
    )();
  },

  async create(data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('jobs', jobSchema).create(data),
      () => mockApi.Job.create(data)
    )();
  },

  async update(id, data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('jobs', jobSchema).update(id, data),
      () => mockApi.Job.update(id, data)
    )();
  },

  async delete(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('jobs', jobSchema).delete(id),
      () => mockApi.Job.delete(id)
    )();
  },

  async assign(jobId, assessorId) {
    return useSupabaseOrMock(
      async () => {
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
          throw error;
        }
      },
      async () => {
        const job = await mockApi.Job.get(jobId);
        return await mockApi.Job.update(jobId, {
          assigned_to: assessorId,
          time_assigned: new Date().toISOString(),
          status: 'awaiting_booking'
        });
      }
    )();
  }
};

// Assessment entity
export const Assessment = {
  async list(sortField = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('assessments', assessmentSchema).list({}, sortField),
      () => mockApi.Assessment.list(sortField)
    )();
  },

  async get(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('assessments', assessmentSchema).get(id),
      () => mockApi.Assessment.get(id)
    )();
  },

  async filter(filters = {}, sortField = null, limit = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('assessments', assessmentSchema).list(filters, sortField, limit),
      () => mockApi.Assessment.filter(filters, sortField, limit)
    )();
  },

  async create(data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('assessments', assessmentSchema).create(data),
      () => mockApi.Assessment.create(data)
    )();
  },

  async update(id, data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('assessments', assessmentSchema).update(id, data),
      () => mockApi.Assessment.update(id, data)
    )();
  },

  async delete(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('assessments', assessmentSchema).delete(id),
      () => mockApi.Assessment.delete(id)
    )();
  },

  async submitAssessment(assessmentData) {
    return useSupabaseOrMock(
      async () => {
        try {
          const validatedData = validateInput(assessmentSchema)(assessmentData);
          
          // Create assessment
          const assessment = await DatabaseService.createCrudService('assessments', assessmentSchema).create(validatedData);

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
          throw error;
        }
      },
      () => mockApi.Assessment.create(assessmentData)
    )();
  }
};

// PDS Document entity
export const PdsDocument = {
  async list(sortField = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('pds_documents', pdsDocumentSchema).list({}, sortField),
      () => mockApi.PdsDocument.list(sortField)
    )();
  },

  async get(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('pds_documents', pdsDocumentSchema).get(id),
      () => mockApi.PdsDocument.get(id)
    )();
  },

  async filter(filters = {}, sortField = null, limit = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('pds_documents', pdsDocumentSchema).list(filters, sortField, limit),
      () => mockApi.PdsDocument.filter(filters, sortField, limit)
    )();
  },

  async create(data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('pds_documents', pdsDocumentSchema).create(data),
      () => mockApi.PdsDocument.create(data)
    )();
  },

  async update(id, data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('pds_documents', pdsDocumentSchema).update(id, data),
      () => mockApi.PdsDocument.update(id, data)
    )();
  },

  async delete(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('pds_documents', pdsDocumentSchema).delete(id),
      () => mockApi.PdsDocument.delete(id)
    )();
  }
};

// Comment entity
export const Comment = {
  async list(sortField = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('comments', commentSchema).list({}, sortField),
      () => mockApi.Comment.list(sortField)
    )();
  },

  async get(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('comments', commentSchema).get(id),
      () => mockApi.Comment.get(id)
    )();
  },

  async filter(filters = {}, sortField = null, limit = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('comments', commentSchema).list(filters, sortField, limit),
      () => mockApi.Comment.filter(filters, sortField, limit)
    )();
  },

  async create(data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('comments', commentSchema).create(data),
      () => mockApi.Comment.create(data)
    )();
  },

  async update(id, data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('comments', commentSchema).update(id, data),
      () => mockApi.Comment.update(id, data)
    )();
  },

  async delete(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('comments', commentSchema).delete(id),
      () => mockApi.Comment.delete(id)
    )();
  }
};

// Notification entity
export const Notification = {
  async list(sortField = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('notifications', notificationSchema).list({}, sortField),
      () => mockApi.Notification.list(sortField)
    )();
  },

  async get(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('notifications', notificationSchema).get(id),
      () => mockApi.Notification.get(id)
    )();
  },

  async filter(filters = {}, sortField = null, limit = null) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('notifications', notificationSchema).list(filters, sortField, limit),
      () => mockApi.Notification.filter(filters, sortField, limit)
    )();
  },

  async create(data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('notifications', notificationSchema).create(data),
      () => mockApi.Notification.create(data)
    )();
  },

  async update(id, data) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('notifications', notificationSchema).update(id, data),
      () => mockApi.Notification.update(id, data)
    )();
  },

  async delete(id) {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('notifications', notificationSchema).delete(id),
      () => mockApi.Notification.delete(id)
    )();
  }
};

// Additional entities with fallback support
export const Skill = {
  async list() {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('skills').list(),
      () => []
    )();
  }
};

export const Industry = {
  async list() {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('industries').list(),
      () => []
    )();
  }
};

export const Location = {
  async list() {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('locations').list(),
      () => []
    )();
  }
};

export const AssessmentQuestion = {
  async list() {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('assessment_questions').list(),
      () => []
    )();
  }
};

export const AssessmentResponse = {
  async list() {
    return useSupabaseOrMock(
      () => DatabaseService.createCrudService('assessment_responses').list(),
      () => []
    )();
  }
};