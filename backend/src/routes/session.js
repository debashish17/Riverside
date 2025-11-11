const { Router } = require('express');
const sessionController = require('../controllers/session');
const { authenticateJWT } = require('../controllers/authMiddleware');

const router = Router();

// Create a new session
router.post('/create', authenticateJWT, sessionController.createSession);

// Join a session
router.post('/join', authenticateJWT, sessionController.joinSession);

// Leave a session (for non-owners)
router.post('/leave', authenticateJWT, sessionController.leaveSession);

// Smart leave - handles both owner (terminate) and member (leave) cases
router.post('/smart-leave', authenticateJWT, sessionController.smartLeaveSession);

// List all sessions for the user (must come before /:sessionId)
router.get('/my', authenticateJWT, sessionController.listUserSessions);

// Get only active sessions for dashboard
router.get('/active', authenticateJWT, sessionController.getActiveSessions);

// Get recent (ended/terminated) sessions for history
router.get('/recent', authenticateJWT, sessionController.getRecentSessions);

// Get all sessions (for debugging - must come before /:sessionId)
router.get('/all', authenticateJWT, sessionController.getAllSessions);

// End (mark as ended) a session (only owner can end)
router.post('/end', authenticateJWT, sessionController.endSession);

// Terminate session and remove all members (only owner can terminate)
router.post('/terminate', authenticateJWT, sessionController.terminateSession);

// Clear (delete) a session completely (only owner can clear)
router.post('/clear', authenticateJWT, sessionController.clearSession);

// Get session details by ID (must be last to avoid conflicts)
router.get('/:sessionId', authenticateJWT, sessionController.getSession);

module.exports = router;
