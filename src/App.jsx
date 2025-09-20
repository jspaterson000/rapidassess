import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from 'react'
import { User } from '@/api/entities'
import LoginPage from '@/pages/Login'
import { Loader2 } from 'lucide-react'
import { logger } from '@/lib/logger'

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App