// Safe environment variable access with defaults
// Centralized configuration management

const env = {
  // Server configuration
  get PORT() {
    return parseInt(process.env.PORT) || 3000;
  },

  get NODE_ENV() {
    return process.env.NODE_ENV || 'development';
  },

  get HOST() {
    return process.env.HOST || '0.0.0.0';
  },

  // Backend service configuration
  get BACKEND_URL() {
    return process.env.BACKEND_URL || 'http://localhost:8080';
  },

  // Frontend configuration
  get FRONTEND_PORT() {
    return parseInt(process.env.FRONTEND_PORT) || 3000;
  },

  get FRONTEND_URL() {
    return process.env.FRONTEND_URL || `http://localhost:${this.FRONTEND_PORT}`;
  },

  // Security configuration
  get SESSION_SECRET() {
    return process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
  },

  get CORS_ORIGINS() {
    if (process.env.CORS_ORIGINS) {
      return process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
    }
    return [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:8080'
    ];
  },

  // Database configuration (if needed in future)
  get DATABASE_URL() {
    return process.env.DATABASE_URL || null;
  },

  // Logging configuration
  get LOG_LEVEL() {
    return process.env.LOG_LEVEL || 'info';
  },

  get LOG_FORMAT() {
    return process.env.LOG_FORMAT || (this.NODE_ENV === 'production' ? 'json' : 'dev');
  },

  // Feature flags
  get ENABLE_REQUEST_LOGGING() {
    return process.env.ENABLE_REQUEST_LOGGING !== 'false';
  },

  get ENABLE_ERROR_STACK_TRACES() {
    return this.NODE_ENV !== 'production';
  },

  // Timeout configurations
  get REQUEST_TIMEOUT() {
    return parseInt(process.env.REQUEST_TIMEOUT) || 30000; // 30 seconds
  },

  get BACKEND_TIMEOUT() {
    return parseInt(process.env.BACKEND_TIMEOUT) || 10000; // 10 seconds
  },

  // Validation helpers
  isProduction() {
    return this.NODE_ENV === 'production';
  },

  isDevelopment() {
    return this.NODE_ENV === 'development';
  },

  isTest() {
    return this.NODE_ENV === 'test';
  },

  // Validation for required environment variables
  validateRequired(requiredVars = []) {
    const missing = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  },

  // Get all environment variables (for debugging)
  getAll() {
    return {
      PORT: this.PORT,
      NODE_ENV: this.NODE_ENV,
      HOST: this.HOST,
      BACKEND_URL: this.BACKEND_URL,
      FRONTEND_PORT: this.FRONTEND_PORT,
      FRONTEND_URL: this.FRONTEND_URL,
      CORS_ORIGINS: this.CORS_ORIGINS,
      LOG_LEVEL: this.LOG_LEVEL,
      LOG_FORMAT: this.LOG_FORMAT,
      REQUEST_TIMEOUT: this.REQUEST_TIMEOUT,
      BACKEND_TIMEOUT: this.BACKEND_TIMEOUT,
      ENABLE_REQUEST_LOGGING: this.ENABLE_REQUEST_LOGGING,
      ENABLE_ERROR_STACK_TRACES: this.ENABLE_ERROR_STACK_TRACES,
      // Don't expose sensitive values
      SESSION_SECRET: this.SESSION_SECRET ? '[SET]' : '[NOT SET]',
      DATABASE_URL: this.DATABASE_URL ? '[SET]' : '[NOT SET]'
    };
  },

  // Safe logging of configuration (without sensitive data)
  logConfiguration() {
    console.log('Environment Configuration:', this.getAll());
  }
};

module.exports = env;