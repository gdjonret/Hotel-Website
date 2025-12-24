const morgan = require('morgan');

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!req._startTime) return '-';
  const diff = process.hrtime(req._startTime);
  return (diff[0] * 1000 + diff[1] * 1e-6).toFixed(2) + 'ms';
});

// Custom token for request ID (if available)
morgan.token('request-id', (req) => {
  return req.id || req.headers['x-request-id'] || '-';
});

// Custom token for user agent
morgan.token('user-agent', (req) => {
  return req.get('User-Agent') || '-';
});

// Development format - detailed logging
const developmentFormat = morgan(':method :url :status :res[content-length] - :response-time-ms :user-agent');

// Production format - structured JSON logging
const productionFormat = morgan((tokens, req, res) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: parseInt(tokens.status(req, res)),
    contentLength: tokens.res(req, res, 'content-length') || 0,
    responseTime: tokens['response-time'](req, res),
    userAgent: tokens['user-agent'](req, res),
    requestId: tokens['request-id'](req, res),
    remoteAddr: tokens['remote-addr'](req, res),
    referrer: tokens.referrer(req, res) || '-'
  });
});

// Custom logging middleware for additional request details
const requestLogger = (req, res, next) => {
  // Add start time for response time calculation
  req._startTime = process.hrtime();
  
  // Generate request ID if not present
  if (!req.id && !req.headers['x-request-id']) {
    req.id = Math.random().toString(36).substr(2, 9);
  }

  // Log request body for POST/PUT requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = '[REDACTED]';
      }
    });

    console.log(`[${req.method}] ${req.url} - Request Body:`, sanitizedBody);
  }

  // Log query parameters for GET requests
  if (req.method === 'GET' && Object.keys(req.query).length > 0) {
    console.log(`[${req.method}] ${req.url} - Query Params:`, req.query);
  }

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  console.error('Request Error:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    requestId: req.id || req.headers['x-request-id'] || '-',
    userAgent: req.get('User-Agent') || '-',
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(err);
};

// Configure logger based on environment
const getLogger = () => {
  if (process.env.NODE_ENV === 'production') {
    return productionFormat;
  }
  return developmentFormat;
};

module.exports = {
  requestLogger,
  errorLogger,
  morganLogger: getLogger(),
  developmentFormat,
  productionFormat
};