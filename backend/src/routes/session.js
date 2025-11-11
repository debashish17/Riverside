const { Router } = require('express');
const sessionController = require('../controllers/session');
const AuthMiddleware = require('../middleware/auth');

const router = Router();

// Create a new session
router.post('/create', AuthMiddleware.authenticate, sessionController.createSession);

// Join a session
router.post('/join', AuthMiddleware.authenticate, sessionController.joinSession);

// Leave a session (for non-owners)
router.post('/leave', AuthMiddleware.authenticate, sessionController.leaveSession);

// Smart leave - handles both owner (terminate) and member (leave) cases
router.post('/smart-leave', AuthMiddleware.authenticate, sessionController.smartLeaveSession);

// List all sessions for the user (must come before /:sessionId)
router.get('/my', AuthMiddleware.authenticate, sessionController.listUserSessions);

// Get only active sessions for dashboard
router.get('/active', AuthMiddleware.authenticate, sessionController.getActiveSessions);

// Get recent (ended/terminated) sessions for history
router.get('/recent', AuthMiddleware.authenticate, sessionController.getRecentSessions);

// Get all sessions (for debugging - must come before /:sessionId)
router.get('/all', AuthMiddleware.authenticate, sessionController.getAllSessions);

// End (mark as ended) a session (only owner can end)
router.post('/end', AuthMiddleware.authenticate, sessionController.endSession);

// Terminate session and remove all members (only owner can terminate)
router.post('/terminate', AuthMiddleware.authenticate, sessionController.terminateSession);

// Clear (delete) a session completely (only owner can clear)
router.post('/clear', AuthMiddleware.authenticate, sessionController.clearSession);

// Get session details by ID (must be last to avoid conflicts)
router.get('/:sessionId', AuthMiddleware.authenticate, sessionController.getSession);

module.exports = router;
