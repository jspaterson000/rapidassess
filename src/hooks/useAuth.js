import { useState, useEffect, useContext, createContext } from 'react';
import { AuthService } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Authentication context and hook for production use
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        logger.info('Initial auth check completed', { 
          authenticated: !!currentUser,
          userId: currentUser?.id 
        });
      } catch (error) {
        logger.error('Initial auth check failed', { error: error.message });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event, userId: session?.user?.id });
        
        setSession(session);
        
        if (session?.user) {
          try {
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            logger.error('Failed to get user profile after auth change', { error: error.message });
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await AuthService.signIn(credentials);
      setUser(result.user);
      setSession(result.session);
      logger.auditLog('user_login', { email: credentials.email });
      return result;
    } catch (error) {
      logger.error('Login failed', { error: error.message, email: credentials.email });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await AuthService.register(userData);
      setUser(result.user);
      setSession(result.session);
      logger.auditLog('user_registration', { email: userData.email });
      return result;
    } catch (error) {
      logger.error('Registration failed', { error: error.message, email: userData.email });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setSession(null);
      logger.auditLog('user_logout');
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = await AuthService.updateProfile(user.id, updates);
      setUser(updatedUser);
      logger.auditLog('profile_updated', { userId: user.id });
      return updatedUser;
    } catch (error) {
      logger.error('Profile update failed', { error: error.message, userId: user?.id });
      throw error;
    }
  };

  const hasRole = (requiredRoles) => {
    return AuthService.hasRole(user, requiredRoles);
  };

  const canAccessCompany = (companyId) => {
    return AuthService.canAccessCompany(user, companyId);
  };

  const value = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    canAccessCompany,
    isAuthenticated: !!user,
    isAdmin: hasRole(['platform_admin', 'company_admin']),
    isAssessor: user?.is_assessor || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook for role-based access control
 */
export function useRequireAuth(requiredRoles = null) {
  const { user, loading, hasRole } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      setAuthorized(false);
      return;
    }

    if (requiredRoles && !hasRole(requiredRoles)) {
      setAuthorized(false);
      logger.warn('Unauthorized access attempt', { 
        userId: user.id, 
        userRole: user.user_role, 
        requiredRoles 
      });
      return;
    }

    setAuthorized(true);
  }, [user, loading, requiredRoles, hasRole]);

  return { user, loading, authorized };
}

export default useAuth;