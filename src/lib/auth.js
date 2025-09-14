import { supabase } from './supabase'
import { User } from '@/api/entities'

class AuthManager {
  constructor() {
    this.currentUser = null
    this.listeners = []
  }

  async signIn(email, password) {
    try {
      // For demo purposes, use mock authentication
      const user = await User.login({ email, password })
      this.currentUser = user
      this.notifyListeners(user)
      
      // Create session record
      await this.createSession(user.id)
      
      return user
    } catch (error) {
      throw new Error('Invalid credentials')
    }
  }

  async signOut() {
    if (this.currentUser) {
      await this.endSession(this.currentUser.id)
    }
    this.currentUser = null
    this.notifyListeners(null)
    localStorage.removeItem('currentUser')
  }

  async getCurrentUser() {
    if (this.currentUser) return this.currentUser
    
    try {
      const user = await User.me()
      this.currentUser = user
      return user
    } catch (error) {
      return null
    }
  }

  async createSession(userId) {
    // In a real app, this would create a session record
    localStorage.setItem('sessionStart', new Date().toISOString())
  }

  async endSession(userId) {
    // In a real app, this would end the session record
    localStorage.removeItem('sessionStart')
  }

  onAuthStateChange(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  notifyListeners(user) {
    this.listeners.forEach(callback => callback(user))
  }
}

export const auth = new AuthManager()