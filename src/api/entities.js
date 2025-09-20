import { supabase } from '@/lib/supabase';
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

/**
 * Production-ready entity services with validation and error handling
 */

// User entity with authentication
export const User = {
  // Authentication methods
  async register(userData) {
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

  async login({ email, password }) {
    try {
      const result = await AuthService.signIn({ email, password });
      logger.auditLog('user_login', { email });
      return result.user;
    } catch (error) {
      logger.error('User login failed', { error: error.message, email });
      throw error;
    }
  },

  async logout() {
    try {
      await AuthService.signOut();
      logger.auditLog('user_logout');
    } catch (error) {
      logger.error('User logout failed', { error: error.message });
      throw error;
    }
  },

  async me() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return user;
    } catch (error) {
      logger.error('Get current user failed', { error: error.message });
      throw error;
    }
  },

  async updateMyUserData(data) {
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

  // CRUD operations
  ...DatabaseService.createCrudService('users', userUpdateSchema)
};

// Company entity
export const Company = {
  ...DatabaseService.createCrudService('companies', companySchema),

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
      throw error;
    }
  }
};

// Job entity
export const Job = {
  ...DatabaseService.createCrudService('jobs', jobSchema),

  async getWithDetails(jobId) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          assigned_user:assigned_to (
            id,
            full_name,
            email,
            phone
          ),
          company:company_id (
            id,
            company_name
          ),
          pds_document:pds_document_id (
            id,
            name,
            insurer,
            version
          ),
          assessments (
            id,
            status,
            assessment_date,
            total_estimate
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get job with details failed', { error: error.message, jobId });
      throw error;
    }
  },

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
      throw error;
    }
  }
};

// Assessment entity
export const Assessment = {
  ...DatabaseService.createCrudService('assessments', assessmentSchema),

  async getWithJobDetails(assessmentId) {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          job:job_id (
            id,
            claim_number,
            customer_name,
            property_address,
            event_type,
            date_of_loss,
            insurer,
            policy_number
          ),
          assessor:assessor_id (
            id,
            full_name,
            email
          )
        `)
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get assessment with details failed', { error: error.message, assessmentId });
      throw error;
    }
  },

  async submitAssessment(assessmentData) {
    try {
      const validatedData = validateInput(assessmentSchema)(assessmentData);
      
      // Create assessment
      const assessment = await this.create(validatedData);

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
  }
};

// PDS Document entity
export const PdsDocument = {
  ...DatabaseService.createCrudService('pds_documents', pdsDocumentSchema)
};

// Comment entity
export const Comment = {
  ...DatabaseService.createCrudService('comments', commentSchema),

  async getJobComments(jobId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:author_id (
            id,
            full_name,
            email
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get job comments failed', { error: error.message, jobId });
      throw error;
    }
  }
};

// Notification entity
export const Notification = {
  ...DatabaseService.createCrudService('notifications', notificationSchema),

  async getUserNotifications(userId, unreadOnly = false) {
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          sender:sender_id (
            id,
            full_name
          ),
          job:job_id (
            id,
            claim_number
          )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get user notifications failed', { error: error.message, userId });
      throw error;
    }
  },

  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Mark notification as read failed', { error: error.message, notificationId });
      throw error;
    }
  }
};

// Skills entity
export const Skill = DatabaseService.createCrudService('skills');

// Industries entity
export const Industry = DatabaseService.createCrudService('industries');

// Locations entity
export const Location = DatabaseService.createCrudService('locations');

// Assessment Questions entity
export const AssessmentQuestion = DatabaseService.createCrudService('assessment_questions');

// Assessment Responses entity
export const AssessmentResponse = DatabaseService.createCrudService('assessment_responses');

// User Skills entity
export const UserSkill = DatabaseService.createCrudService('user_skills');

// Job Skills entity
export const JobSkill = DatabaseService.createCrudService('job_skills');

// Audit Logs entity (read-only for most users)
export const AuditLog = {
  async list(filters = {}, orderBy = '-created_at', limit = 100) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:user_id (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Get audit logs failed', { error: error.message });
      throw error;
    }
  }
};