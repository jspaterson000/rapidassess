/**
 * Production performance monitoring and optimization utilities
 */

import { logger } from './logger';

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = !import.meta.env.DEV || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING;
  }

  /**
   * Start timing an operation
   */
  startTiming(label) {
    if (!this.isEnabled) return;
    
    this.metrics.set(label, {
      startTime: performance.now(),
      label
    });
  }

  /**
   * End timing and log result
   */
  endTiming(label, context = {}) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(label);
    if (!metric) return;

    const duration = performance.now() - metric.startTime;
    this.metrics.delete(label);

    logger.performance(label, duration, context);

    // Log slow operations
    if (duration > 1000) { // > 1 second
      logger.warn('Slow operation detected', { label, duration, context });
    }

    return duration;
  }

  /**
   * Measure function execution time
   */
  async measureAsync(label, fn, context = {}) {
    this.startTiming(label);
    try {
      const result = await fn();
      this.endTiming(label, context);
      return result;
    } catch (error) {
      this.endTiming(label, { ...context, error: error.message });
      throw error;
    }
  }

  /**
   * Monitor Core Web Vitals
   */
  observeWebVitals() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        logger.performance('LCP', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          logger.performance('FID', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        if (clsValue > 0) {
          logger.performance('CLS', clsValue);
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported');
      }
    }
  }

  /**
   * Monitor resource loading
   */
  observeResourceTiming() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 1000) { // Log slow resources
            logger.performance('slow_resource', entry.duration, {
              name: entry.name,
              type: entry.initiatorType
            });
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported');
      }
    }
  }

  /**
   * Memory usage monitoring
   */
  checkMemoryUsage() {
    if (!this.isEnabled || !performance.memory) return;

    const memory = performance.memory;
    const usage = {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    };

    logger.performance('memory_usage', usage.used, usage);

    // Warn if memory usage is high
    if (usage.used / usage.limit > 0.8) {
      logger.warn('High memory usage detected', usage);
    }

    return usage;
  }

  /**
   * Cleanup observers
   */
  disconnect() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Lazy loading utility
 */
export function lazyLoad(importFunc) {
  return React.lazy(() => {
    return performanceMonitor.measureAsync('component_load', importFunc);
  });
}

/**
 * Image optimization utility
 */
export function optimizeImageUrl(url, options = {}) {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If using a CDN like Cloudinary or similar, add optimization parameters
  if (url.includes('cloudinary.com')) {
    let optimized = url.replace('/upload/', `/upload/q_${quality},f_${format}/`);
    if (width) optimized = optimized.replace('/upload/', `/upload/w_${width}/`);
    if (height) optimized = optimized.replace('/upload/', `/upload/h_${height}/`);
    return optimized;
  }
  
  // For other URLs, return as-is (implement CDN-specific logic as needed)
  return url;
}

/**
 * Bundle size monitoring
 */
export function monitorBundleSize() {
  if (typeof window === 'undefined') return;

  // Monitor initial bundle load time
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      logger.performance('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
      logger.performance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
    }
  });
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.observeWebVitals();
  performanceMonitor.observeResourceTiming();
  monitorBundleSize();
  
  // Check memory usage every 30 seconds
  setInterval(() => {
    performanceMonitor.checkMemoryUsage();
  }, 30000);
}

export default {
  performanceMonitor,
  debounce,
  throttle,
  lazyLoad,
  optimizeImageUrl,
  monitorBundleSize
};