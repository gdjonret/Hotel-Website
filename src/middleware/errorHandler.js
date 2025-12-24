// Central error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Default error response
  let error = {
    error: 'Internal Server Error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.url
  };

  // Handle different error types
  if (err.isBackendError) {
    // Backend service errors
    error = {
      error: 'Backend Service Error',
      message: err.message,
      details: err.data,
      timestamp: new Date().toISOString(),
      path: req.url
    };
    return res.status(err.status || 500).json(error);
  }

  if (err.name === 'ValidationError') {
    // Validation errors
    error = {
      error: 'Validation Error',
      message: 'Invalid input data',
      details: err.details || err.message,
      timestamp: new Date().toISOString(),
      path: req.url
    };
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    // Database cast errors (invalid IDs, etc.)
    error = {
      error: 'Invalid Resource ID',
      message: 'The provided ID is not valid',
      timestamp: new Date().toISOString(),
      path: req.url
    };
    return res.status(400).json(error);
  }

  if (err.code === 'ECONNREFUSED') {
    // Connection refused errors
    error = {
      error: 'Service Unavailable',
      message: 'Backend service is currently unavailable',
      timestamp: new Date().toISOString(),
      path: req.url
    };
    return res.status(503).json(error);
  }

  if (err.code === 'ENOTFOUND') {
    // DNS resolution errors
    error = {
      error: 'Service Configuration Error',
      message: 'Unable to connect to backend service',
      timestamp: new Date().toISOString(),
      path: req.url
    };
    return res.status(503).json(error);
  }

  // Handle specific HTTP status codes
  const statusCode = err.status || err.statusCode || 500;
  
  if (statusCode === 404) {
    error = {
      error: 'Not Found',
      message: 'The requested resource was not found',
      timestamp: new Date().toISOString(),
      path: req.url
    };
  } else if (statusCode === 401) {
    error = {
      error: 'Unauthorized',
      message: 'Authentication required',
      timestamp: new Date().toISOString(),
      path: req.url
    };
  } else if (statusCode === 403) {
    error = {
      error: 'Forbidden',
      message: 'Access denied',
      timestamp: new Date().toISOString(),
      path: req.url
    };
  } else if (statusCode >= 400 && statusCode < 500) {
    error = {
      error: 'Client Error',
      message: err.message || 'Bad request',
      timestamp: new Date().toISOString(),
      path: req.url
    };
  }

  // Don't expose stack traces in production
  if (process.env.NODE_ENV !== 'production') {
    error.stack = err.stack;
  }

  res.status(statusCode).json(error);
};

// 404 handler for unmatched routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
    path: req.url
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};