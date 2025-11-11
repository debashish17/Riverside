const jwt = require("jsonwebtoken");

// Get JWT secret with fallback
let JWT_SECRET;
try {
  const environment = require('../config/environment');
  JWT_SECRET = environment.getJWTSecret();
} catch (error) {
  JWT_SECRET = process.env.JWT_SECRET || "supersecret";
}

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "Access denied",
        message: "No token provided or invalid format" 
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        error: "Access denied",
        message: "Token is required" 
      });
    }
    
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    
    console.log(`🔐 Authenticated user: ${payload.username}`);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expired",
        message: "Please login again" 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: "Invalid token",
        message: "Token is malformed or invalid" 
      });
    }
    
    return res.status(401).json({ 
      error: "Authentication failed",
      message: "Token verification failed" 
    });
  }
}

// Optional authentication middleware
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // For optional auth, continue without user if token is invalid
    console.warn('⚠️ Optional auth failed:', error.message);
    next();
  }
}

module.exports = { authenticateJWT, optionalAuth };
