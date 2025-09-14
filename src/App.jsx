import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "sonner"
import { useState, useEffect } from 'react'
import { User } from '@/api/entities'
import LoginPage from '@/pages/Login'
import { Loader2 } from 'lucide-react'
import { auth } from '@/lib/auth'
import { notifications } from '@/lib/notifications'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChange((user) => {
      setIsAuthenticated(!!user)
      if (user) {
        notifications.success(`Welcome back, ${user.full_name}!`)
      }
    })
    
    return unsubscribe
  }, [])

  const checkAuthStatus = async () => {
    try {
      await User.me()
      setIsAuthenticated(true)
    } catch (error) {
      console.log('User not authenticated, redirecting to login page')
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

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
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#1e293b'
          }
        }}
      />
    </>
  )
}

export default App