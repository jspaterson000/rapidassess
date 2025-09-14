// Role-based access control
export const ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  COMPANY_ADMIN: 'company_admin', 
  MANAGER: 'manager',
  ASSESSOR: 'assessor',
  USER: 'user'
}

export const PERMISSIONS = {
  // Job management
  CREATE_JOB: 'create_job',
  EDIT_JOB: 'edit_job',
  DELETE_JOB: 'delete_job',
  ASSIGN_JOB: 'assign_job',
  VIEW_ALL_JOBS: 'view_all_jobs',
  
  // Assessment management
  CREATE_ASSESSMENT: 'create_assessment',
  EDIT_ASSESSMENT: 'edit_assessment',
  APPROVE_ASSESSMENT: 'approve_assessment',
  
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USER_PERFORMANCE: 'view_user_performance',
  
  // Company management
  MANAGE_COMPANY: 'manage_company',
  VIEW_ANALYTICS: 'view_analytics',
  
  // System administration
  MANAGE_PDS: 'manage_pds',
  VIEW_AUDIT_LOGS: 'view_audit_logs'
}

const ROLE_PERMISSIONS = {
  [ROLES.PLATFORM_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.COMPANY_ADMIN]: [
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.EDIT_JOB,
    PERMISSIONS.DELETE_JOB,
    PERMISSIONS.ASSIGN_JOB,
    PERMISSIONS.VIEW_ALL_JOBS,
    PERMISSIONS.CREATE_ASSESSMENT,
    PERMISSIONS.EDIT_ASSESSMENT,
    PERMISSIONS.APPROVE_ASSESSMENT,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USER_PERFORMANCE,
    PERMISSIONS.MANAGE_COMPANY,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.EDIT_JOB,
    PERMISSIONS.ASSIGN_JOB,
    PERMISSIONS.VIEW_ALL_JOBS,
    PERMISSIONS.CREATE_ASSESSMENT,
    PERMISSIONS.EDIT_ASSESSMENT,
    PERMISSIONS.VIEW_USER_PERFORMANCE,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.ASSESSOR]: [
    PERMISSIONS.CREATE_ASSESSMENT,
    PERMISSIONS.EDIT_ASSESSMENT
  ],
  [ROLES.USER]: [
    PERMISSIONS.CREATE_ASSESSMENT,
    PERMISSIONS.EDIT_ASSESSMENT
  ]
}

export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

export const canManageJobs = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.ASSIGN_JOB)
}

export const canViewAnalytics = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.VIEW_ANALYTICS)
}

export const canManageUsers = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.MANAGE_USERS)
}