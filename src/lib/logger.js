/**
 * Production-ready logging service
 */

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = import.meta.env.VITE_LOG_LEVEL || 'info';
  }

  /**
   * Log levels: error, warn, info, debug
   */
  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(context).length > 0 ? JSON.stringify(context) : '';
    
    return {
      timestamp,
      level: level.toUpperCase(),
      message,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  /**
   * Send logs to external service in production
   */
  async sendToService(logData) {
    if (!this.isDevelopment && import.meta.env.VITE_LOG_ENDPOINT) {
      try {
        await fetch(import.meta.env.VITE_LOG_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
      } catch (error) {
        console.error('Failed to send log to service:', error);
      }
    }
  }

  error(message, context = {}) {
    if (!this.shouldLog('error')) return;
    
    const logData = this.formatMessage('error', message, context);
    console.error(message, context);
    this.sendToService(logData);
  }

  warn(message, context = {}) {
    if (!this.shouldLog('warn')) return;
    
    const logData = this.formatMessage('warn', message, context);
    console.warn(message, context);
    this.sendToService(logData);
  }

  info(message, context = {}) {
    if (!this.shouldLog('info')) return;
    
    const logData = this.formatMessage('info', message, context);
    console.info(message, context);
    this.sendToService(logData);
  }

  debug(message, context = {}) {
    if (!this.shouldLog('debug')) return;
    
    const logData = this.formatMessage('debug', message, context);
    console.debug(message, context);
    this.sendToService(logData);
  }

  /**
   * Log user actions for audit trail
   */
  auditLog(action, details = {}) {
    this.info(`User Action: ${action}`, {
      action,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log performance metrics
   */
  performance(metric, value, context = {}) {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      ...context
    });
  }

  /**
   * Log API calls
   */
  apiCall(method, url, status, duration, context = {}) {
    this.info(`API Call: ${method} ${url}`, {
      method,
      url,
      status,
      duration,
      ...context
    });
  }
}

export const logger = new Logger();
export default logger;