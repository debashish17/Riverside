const express = require("express");
const { login, signup, getUsers } = require("../controllers/auth.js");
const { authenticateJWT, optionalAuth } = require("../controllers/authMiddleware.js");

const router = express.Router();

// Public routes
router.post("/register", signup);
router.post("/signup", signup); // Alias for compatibility
router.post("/login", login);
router.post("/logout", (req, res) => {
  // For stateless JWT, logout is handled client-side
  // This endpoint can be used for logging/analytics
  res.json({ 
    message: "Logout successful",
    timestamp: new Date().toISOString() 
  });
});

// Protected routes
router.get("/users", authenticateJWT, getUsers);

// Health check for auth service
router.get("/health", (req, res) => {
  res.json({ 
    service: 'auth',
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
});

// Test route to verify token
router.get("/verify", authenticateJWT, (req, res) => {
  res.json({ 
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

module.exports = router;
