/**
 * Production security utilities and middleware
 */

import { logger } from './logger';

/**
 * Rate limiting implementation
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.maxRequests = 100; // per window
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    this.requests.set(identifier, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      logger.warn('Rate limit exceeded', { identifier, requests: validRequests.length });
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  getRemainingRequests(identifier) {
    const userRequests = this.requests.get(identifier) || [];
    return Math.max(0, this.maxRequests - userRequests.length);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Input sanitization
 */
export const sanitize = {
  /**
   * Sanitize HTML content
   */
  html(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Sanitize SQL input (basic protection)
   */
  sql(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[';--]/g, '') // Remove SQL injection characters
      .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\b/gi, '') // Remove SQL keywords
      .trim();
  },

  /**
   * Sanitize file names
   */
  fileName(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters
      .replace(/_{2,}/g, '_') // Replace multiple underscores
      .slice(0, 255); // Limit length
  },

  /**
   * Sanitize email addresses
   */
  email(input) {
    if (typeof input !== 'string') return input;
    
    return input.toLowerCase().trim();
  }
};

/**
 * Content Security Policy headers
 */
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * Validate session and user permissions
 */
export const validateSession = async (requiredRole = null) => {
  try {
    const { User } = await import('@/api/entities');
    const user = await User.me();
    
    if (!user) {
      throw new Error('Authentication required');
    }

    if (requiredRole && !AuthService.hasRole(user, requiredRole)) {
      throw new Error('Insufficient permissions');
    }

    return user;
  } catch (error) {
    logger.error('Session validation failed', { error: error.message, requiredRole });
    throw error;
  }
};

/**
 * Audit logging for sensitive operations
 */
export const auditSensitiveOperation = (operation, details = {}) => {
  logger.auditLog(`sensitive_operation_${operation}`, {
    operation,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Data encryption utilities (for sensitive data)
 */
export const encryption = {
  /**
   * Simple encryption for client-side sensitive data
   * In production, use proper encryption libraries
   */
  encrypt(text, key = 'default-key') {
    // This is a simple example - use proper encryption in production
    return btoa(text + key);
  },

  decrypt(encryptedText, key = 'default-key') {
    try {
      const decoded = atob(encryptedText);
      return decoded.replace(key, '');
    } catch (error) {
      logger.error('Decryption failed', { error: error.message });
      return null;
    }
  }
};

export default {
  rateLimiter,
  sanitize,
  securityHeaders,
  validateSession,
  auditSensitiveOperation,
  encryption
};