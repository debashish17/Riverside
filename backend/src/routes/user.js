const express = require("express");
const { authenticateJWT } = require("../controllers/authMiddleware.js");

const router = express.Router();

// Get current user profile
router.get("/me", authenticateJWT, (req, res) => {
  try {
    const user = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    };
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile' 
    });
  }
});

// Alternative endpoint for compatibility
router.get("/profile", authenticateJWT, (req, res) => {
  try {
    const user = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    };
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch profile' 
    });
  }
});

// Update user profile
router.put("/profile", authenticateJWT, (req, res) => {
  try {
    const { email, displayName } = req.body;
    
    // In a real app, this would update the database
    // For now, just return success with updated info
    const updatedUser = {
      id: req.user.id,
      username: req.user.username,
      email: email || req.user.email,
      displayName: displayName || req.user.username
    };
    
    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update profile' 
    });
  }
});

// Health check for user service
router.get('/health', (req, res) => {
  res.json({ 
    service: 'user',
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;
