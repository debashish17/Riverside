const environment = require('../config/environment');

class ErrorHandler {
  static notFound(req, res, next) {
    const error = new Error(`🔍 Route not found: ${req.originalUrl}`);
    error.status = 404;
    next(error);
  }

  static global(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log error details
    console.error('❌ Error occurred:', {
      status,
      message,
      stack: environment.isDevelopment() ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Don't expose stack traces in production
    const response = {
      error: true,
      status,
      message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    };

    // Include stack trace in development
    if (environment.isDevelopment()) {
      response.stack = err.stack;
      response.details = err.details || null;
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
      response.status = 400;
      response.message = 'Validation failed';
      response.errors = err.errors;
    }

    if (err.name === 'UnauthorizedError') {
      response.status = 401;
      response.message = 'Authentication required';
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      response.status = 413;
      response.message = 'File too large';
    }

    if (err.code === 'ENOENT') {
      response.status = 404;
      response.message = 'File not found';
    }

    res.status(status).json(response);
  }

  static async(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  static validation(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        const validationError = new Error('Validation failed');
        validationError.status = 400;
        validationError.name = 'ValidationError';
        validationError.errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));
        
        return next(validationError);
      }
      
      next();
    };
  }
}

module.exports = ErrorHandler;