import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from 'react'
import { User } from '@/api/entities'
import LoginPage from '@/pages/Login'
import { Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { isSupabaseConfigured } from '@/lib/supabase'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const user = await User.me()
      if (user) {
        setIsAuthenticated(true)
        logger.info('User authenticated', { userId: user.id, email: user.email })
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.log('User not authenticated, redirecting to login page')
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    logger.auditLog('login_success')
  }

  // Global error boundary
  useEffect(() => {
    const handleError = (event) => {
      logger.error('Unhandled error', {
        message: event.error?.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }

    const handleRejection = (event) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  // Show configuration status in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Supabase configured:', isSupabaseConfigured)
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured - using mock data. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use real database.')
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
          {!isSupabaseConfigured && (
            <p className="text-xs text-amber-600 mt-2">Running in demo mode</p>
          )}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Pages />
      <Toaster />
    </ErrorBoundary>
  )
}

export default App