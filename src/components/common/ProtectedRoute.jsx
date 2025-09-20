import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protected route component with role-based access control
 */
export default function ProtectedRoute({ 
  children, 
  requiredRoles = null, 
  requiredCompanyAccess = null,
  fallback = null 
}) {
  const { user, loading, hasRole, canAccessCompany } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Checking permissions..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-slate-800">
              Authentication Required
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Please sign in to access this page.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role-based access
  if (requiredRoles && !hasRole(requiredRoles)) {
    return fallback || (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl text-slate-800">
              Access Denied
            </CardTitle>
            <p className="text-slate-600 mt-2">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Required role: {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check company-based access
  if (requiredCompanyAccess && !canAccessCompany(requiredCompanyAccess)) {
    return fallback || (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl text-slate-800">
              Company Access Required
            </CardTitle>
            <p className="text-slate-600 mt-2">
              You don't have access to this company's data.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}

/**
 * Higher-order component for protecting routes
 */
export function withProtectedRoute(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Role-based component rendering
 */
export function RoleBasedRender({ 
  user, 
  allowedRoles, 
  children, 
  fallback = null 
}) {
  const { hasRole } = useAuth();
  
  if (!user || (allowedRoles && !hasRole(allowedRoles))) {
    return fallback;
  }
  
  return children;
}