import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database tables schema
export const TABLES = {
  USERS: 'users',
  COMPANIES: 'companies', 
  JOBS: 'jobs',
  ASSESSMENTS: 'assessments',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
  PDS_DOCUMENTS: 'pds_documents',
  AUDIT_LOGS: 'audit_logs',
  USER_SESSIONS: 'user_sessions'
}

// Real-time subscriptions
export const subscribeToJobs = (callback) => {
  return supabase
    .channel('jobs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, callback)
    .subscribe()
}

export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` }, 
      callback
    )
    .subscribe()
}