import { supabase } from './supabase';

/**
 * Production-ready authentication service
 * Handles user registration, login, logout, and session management
 */

export class AuthService {
  /**
   * Register a new user with email and password
   */
  static async register({ email, password, fullName, phone, companyId, userRole = 'user' }) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (authError) throw authError;

      // Create user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          phone,
          company_id: companyId,
          user_role: userRole,
          email_verified: false
        })
        .select()
        .single();

      if (userError) throw userError;

      return { user: userData, session: authData.session };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return { user: profile, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Sign in failed');
    }
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Sign out failed');
    }
  }

  /**
   * Get current user session and profile
   */
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) return null;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return profile;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      throw new Error('Failed to update password');
    }
  }

  /**
   * Check if user has required role
   */
  static hasRole(user, requiredRoles) {
    if (!user || !user.user_role) return false;
    if (typeof requiredRoles === 'string') {
      return user.user_role === requiredRoles;
    }
    return requiredRoles.includes(user.user_role);
  }

  /**
   * Check if user can access resource
   */
  static canAccessCompany(user, companyId) {
    if (!user) return false;
    if (user.user_role === 'platform_admin') return true;
    return user.company_id === companyId;
  }

  /**
   * Listen for auth state changes
   */
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export default AuthService;