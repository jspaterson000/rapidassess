// Audit logging system
class AuditLogger {
  constructor() {
    this.logs = []
  }

  async log(action, details = {}) {
    const logEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action,
      user_id: details.user_id,
      resource_type: details.resource_type,
      resource_id: details.resource_id,
      changes: details.changes,
      ip_address: details.ip_address || 'unknown',
      user_agent: details.user_agent || navigator.userAgent,
      session_id: details.session_id
    }

    this.logs.push(logEntry)
    
    // In a real app, this would be sent to the database
    console.log('Audit Log:', logEntry)
    
    return logEntry
  }

  async logJobAction(action, jobId, userId, changes = {}) {
    return this.log(action, {
      user_id: userId,
      resource_type: 'job',
      resource_id: jobId,
      changes
    })
  }

  async logAssessmentAction(action, assessmentId, userId, changes = {}) {
    return this.log(action, {
      user_id: userId,
      resource_type: 'assessment', 
      resource_id: assessmentId,
      changes
    })
  }

  async logUserAction(action, targetUserId, userId, changes = {}) {
    return this.log(action, {
      user_id: userId,
      resource_type: 'user',
      resource_id: targetUserId,
      changes
    })
  }

  async logAuthAction(action, userId, details = {}) {
    return this.log(action, {
      user_id: userId,
      resource_type: 'auth',
      ...details
    })
  }

  async getLogs(filters = {}) {
    let filteredLogs = [...this.logs]

    if (filters.user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === filters.user_id)
    }

    if (filters.resource_type) {
      filteredLogs = filteredLogs.filter(log => log.resource_type === filters.resource_type)
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action)
    }

    if (filters.start_date) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.start_date))
    }

    if (filters.end_date) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.end_date))
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9)
  }
}

export const auditLogger = new AuditLogger()

// Audit action constants
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',
  
  // Jobs
  JOB_CREATED: 'job_created',
  JOB_UPDATED: 'job_updated',
  JOB_DELETED: 'job_deleted',
  JOB_ASSIGNED: 'job_assigned',
  JOB_UNASSIGNED: 'job_unassigned',
  
  // Assessments
  ASSESSMENT_STARTED: 'assessment_started',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  ASSESSMENT_UPDATED: 'assessment_updated',
  
  // Users
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_ROLE_CHANGED: 'user_role_changed',
  
  // Company
  COMPANY_UPDATED: 'company_updated',
  
  // Files
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted'
}