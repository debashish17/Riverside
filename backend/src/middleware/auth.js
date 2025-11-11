const jwt = require('jsonwebtoken');
const environment = require('../config/environment');

class AuthMiddleware {
  static authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Access denied', 
          message: 'No token provided or invalid format' 
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Access denied', 
          message: 'Token is required' 
        });
      }

      const decoded = jwt.verify(token, environment.getJWTSecret());
      req.user = decoded;
      next();
    } catch (error) {
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired', 
          message: 'Please login again' 
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token', 
          message: 'Token is malformed or invalid' 
        });
      }
      
      return res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'Token verification failed' 
      });
    }
  }

  static optional(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, environment.getJWTSecret());
        req.user = decoded;
      }
      
      next();
    } catch (error) {
      // For optional auth, continue without user if token is invalid
      console.warn('⚠️ Optional auth failed:', error.message);
      next();
    }
  }

  static requireRole(role) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required', 
          message: 'Please login to access this resource' 
        });
      }
      
      if (req.user.role !== role) {
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          message: `${role} role required` 
        });
      }
      
      next();
    };
  }

  static requireAnyRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required', 
          message: 'Please login to access this resource' 
        });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          message: `One of the following roles required: ${roles.join(', ')}` 
        });
      }
      
      next();
    };
  }
}

module.exports = AuthMiddleware;