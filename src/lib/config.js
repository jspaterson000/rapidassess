/**
 * Production configuration management
 */

const config = {
  // Application
  app: {
    name: import.meta.env.VITE_APP_NAME || 'RapidAssess',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development'
  },

  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },

  // OpenAI
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.1
  },

  // Logging
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
    endpoint: import.meta.env.VITE_LOG_ENDPOINT
  },

  // Performance
  performance: {
    enabled: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
    sampleRate: 0.1 // 10% sampling in production
  },

  // Security
  security: {
    rateLimitEnabled: import.meta.env.VITE_ENABLE_RATE_LIMITING === 'true',
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
    allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['image/*', 'application/pdf']
  },

  // Features
  features: {
    aiAnalysis: import.meta.env.VITE_ENABLE_AI_ANALYSIS === 'true',
    realTimeNotifications: import.meta.env.VITE_ENABLE_REAL_TIME_NOTIFICATIONS === 'true',
    auditLogging: import.meta.env.VITE_ENABLE_AUDIT_LOGGING === 'true'
  },

  // External Services
  external: {
    mapsApiKey: import.meta.env.VITE_MAPS_API_KEY,
    analyticsId: import.meta.env.VITE_ANALYTICS_ID
  },

  // Validation
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    }
  },

  // UI
  ui: {
    itemsPerPage: 20,
    maxSearchResults: 100,
    debounceDelay: 300,
    animationDuration: 200
  }
};

/**
 * Validate required configuration
 */
export function validateConfig() {
  const required = [
    'supabase.url',
    'supabase.anonKey'
  ];

  const missing = required.filter(path => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config);
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  return true;
}

/**
 * Get configuration value with fallback
 */
export function getConfig(path, fallback = null) {
  const value = path.split('.').reduce((obj, key) => obj?.[key], config);
  return value !== undefined ? value : fallback;
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature) {
  return getConfig(`features.${feature}`, false);
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const env = config.app.environment;
  
  return {
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isStaging: env === 'staging',
    enableDebugMode: env !== 'production',
    enableSourceMaps: env === 'development',
    enableHotReload: env === 'development'
  };
}

export default config;