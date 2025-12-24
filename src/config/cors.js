// CORS configuration for the BFF
const env = require('../utils/env');

const corsConfig = {
  // Use environment-based origins with fallback
  origin: env.isProduction() 
    ? env.CORS_ORIGINS.filter(origin => origin.startsWith('https://'))
    : env.CORS_ORIGINS,
  
  // Enable credentials for session-based authentication
  credentials: true,
  
  // Handle preflight requests properly
  optionsSuccessStatus: 200,
  
  // Allow common headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Request-ID'
  ],
  
  // Allow common methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  
  // Cache preflight responses for 24 hours
  maxAge: 86400
};

module.exports = corsConfig;
