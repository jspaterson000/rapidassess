import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

/**
 * Production-ready error boundary component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.state.errorId;
    
    // Log error details
    logger.error('React Error Boundary caught error', {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      props: this.props
    });

    this.setState({
      error,
      errorInfo
    });

    // Report to external error tracking service
    if (import.meta.env.VITE_ERROR_REPORTING_ENDPOINT) {
      fetch(import.meta.env.VITE_ERROR_REPORTING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(err => {
        console.error('Failed to report error:', err);
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;
      
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">
                Something went wrong
              </CardTitle>
              <p className="text-slate-600 mt-2">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error ID for support */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-slate-500">
                  Please include this ID when contacting support.
                </p>
              </div>

              {/* Development error details */}
              {isDevelopment && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Development Error Details:</h3>
                  <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </div>

              {/* Support information */}
              <div className="text-center text-sm text-slate-500">
                <p>
                  If this problem persists, please contact support at{' '}
                  <a 
                    href="mailto:support@rapidassess.com" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    support@rapidassess.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary(Component, fallback = null) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook for handling async errors in components
 */
export function useErrorHandler() {
  const handleError = (error, context = {}) => {
    logger.error('Component error handled', {
      error: error.message,
      stack: error.stack,
      context
    });

    // You could also trigger a toast notification here
    console.error('Error handled by useErrorHandler:', error);
  };

  return handleError;
}

export default ErrorBoundary;