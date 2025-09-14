

// Enhanced utility functions

export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

// Data validation utilities
export const validators = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone: string) => /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, '')),
  claimNumber: (claim: string) => /^[A-Z]{2,4}-\d{4}-\d{3,6}$/.test(claim),
  postcode: (postcode: string) => /^\d{4}$/.test(postcode)
}

// Formatting utilities
export const formatters = {
  currency: (amount: number) => new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(amount),
  
  phone: (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    return phone
  },
  
  address: (address: string) => {
    if (address.length > 50) {
      return address.substring(0, 47) + '...'
    }
    return address
  }
}

// Performance monitoring
export const performance = {
  measureTime: (name: string) => {
    const start = performance.now()
    return () => {
      const end = performance.now()
      console.log(`${name} took ${end - start} milliseconds`)
    }
  },
  
  debounce: (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

// Error handling utilities
export const errorHandler = {
  logError: (error: Error, context: string) => {
    console.error(`Error in ${context}:`, error)
    // In production, this would send to error tracking service
  },
  
  handleApiError: (error: any) => {
    if (error.response?.status === 401) {
      return 'Authentication required'
    } else if (error.response?.status === 403) {
      return 'Access denied'
    } else if (error.response?.status === 404) {
      return 'Resource not found'
    } else if (error.response?.status >= 500) {
      return 'Server error - please try again later'
    }
    return error.message || 'An unexpected error occurred'
  }
}