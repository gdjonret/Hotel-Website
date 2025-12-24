const axios = require('axios');
const env = require('../utils/env');

// Create axios instance with base configuration
const backendClient = axios.create({
  baseURL: env.BACKEND_URL,
  timeout: env.BACKEND_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for logging
backendClient.interceptors.request.use(
  (config) => {
    console.log(`[Backend Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Backend Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
backendClient.interceptors.response.use(
  (response) => {
    console.log(`[Backend Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[Backend Response Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Transform backend errors into consistent format
    const transformedError = {
      message: error.message,
      status: error.response?.status || 500,
      data: error.response?.data || null,
      isBackendError: true
    };
    
    return Promise.reject(transformedError);
  }
);

module.exports = backendClient;