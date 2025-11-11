const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// File-based storage for recordings metadata (simple JSON file persistence)
const METADATA_FILE = path.join(__dirname, '../../uploads/recordings-metadata.json');

// Load metadata from file or initialize empty array
let recordingsMetadata = [];
try {
  if (fs.existsSync(METADATA_FILE)) {
    const data = fs.readFileSync(METADATA_FILE, 'utf8');
    recordingsMetadata = JSON.parse(data);
    console.log(`Loaded ${recordingsMetadata.length} recording metadata entries`);
  }
} catch (err) {
  console.error('Error loading recordings metadata:', err);
  recordingsMetadata = [];
}

// Save metadata to file
const saveMetadata = () => {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.dirname(METADATA_FILE);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    fs.writeFileSync(METADATA_FILE, JSON.stringify(recordingsMetadata, null, 2));
    console.log(`Saved ${recordingsMetadata.length} recording metadata entries`);
  } catch (err) {
    console.error('Error saving recordings metadata:', err);
  }
};

// Set up multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '../../uploads/')
});

// POST /api/recordings/upload - upload a recording from session
router.post('/upload', upload.single('recording'), async (req, res) => {
  try {
    const { sessionId, sessionName } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Missing recording file' });
    }

    // Add original extension to filename
    const ext = path.extname(file.originalname);
    const newFilename = file.filename + ext;
    const newPath = path.join(file.destination, newFilename);
    fs.renameSync(file.path, newPath);
    file.filename = newFilename;
    file.path = newPath;

    console.log(`📹 Recording uploaded for session ${sessionId}:`, file.originalname);

    // Log the recording upload with session information
      const uploadInfo = {
        filename: file.filename, // filename now always includes extension
        originalname: file.originalname,
        sessionId: sessionId,
        sessionName: sessionName || `Session ${sessionId}`,
        uploadedAt: new Date(),
        size: file.size,
        type: 'session-recording'
      };

    // Store metadata and save to file for persistence
    recordingsMetadata.push(uploadInfo);
    saveMetadata();
    res.json({
      message: 'Session recording saved successfully',
      ...uploadInfo
    });
  } catch (err) {
    console.error('❌ Failed to upload session recording:', err);
    res.status(500).json({ error: 'Failed to upload recording' });
  }
});

// POST /api/recordings - upload a recording and associate with a project
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { projectId, sessionId, sessionName } = req.body;
    const file = req.file;
    if (!file || !projectId) {
      return res.status(400).json({ error: 'Missing file or projectId' });
    }

    // Add original extension to filename
    const ext = path.extname(file.originalname);
    const newFilename = file.filename + ext;
    const newPath = path.join(file.destination, newFilename);
    fs.renameSync(file.path, newPath);
    file.filename = newFilename;
    file.path = newPath;

    // Log the recording upload with session information
    const uploadInfo = {
      filename: file.filename, // filename now always includes extension
      originalname: file.originalname,
      projectId,
      uploadedAt: new Date(),
      size: file.size
    };

    // Add session information if provided
    if (sessionId) {
      uploadInfo.sessionId = sessionId;
      uploadInfo.sessionName = sessionName || `Session ${sessionId}`;
      console.log(`Recording uploaded for session ${sessionId} (${sessionName}):`, file.originalname);
    } else {
      console.log('Manual recording uploaded:', file.originalname);
    }

    // Store metadata and save to file for persistence
    recordingsMetadata.push(uploadInfo);
    saveMetadata();
    res.json({
      message: sessionId ? 'Session recording saved' : 'Recording uploaded',
      ...uploadInfo
    });
  } catch (err) {
    console.error('Failed to upload recording:', err);
    res.status(500).json({ error: 'Failed to upload recording' });
  }
});

// GET /api/recordings - get list of all recordings
router.get('/', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads/');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json([]);
    }

    // Get all .webm files from uploads directory
    const files = fs.readdirSync(uploadsDir);
    const recordings = files
      .filter(file => file.endsWith('.webm'))
      .map(filename => {
        const filePath = path.join(uploadsDir, filename);
        
        // Skip if file doesn't exist (race condition)
        if (!fs.existsSync(filePath)) return null;
        
        const stats = fs.statSync(filePath);
        
        // Find saved metadata
        const metadata = recordingsMetadata.find(m => m.filename === filename);
        
        return {
          filename,
          originalname: metadata?.originalname || filename,
          projectId: metadata?.projectId || 1,
          sessionId: metadata?.sessionId,
          sessionName: metadata?.sessionName,
          uploadedAt: metadata?.uploadedAt || stats.birthtime,
          size: metadata?.size || stats.size,
          ...metadata
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); // Sort by newest first

    console.log(`Returning ${recordings.length} recordings (${recordingsMetadata.length} with metadata)`);
    res.json(recordings);
  } catch (err) {
    console.error('Failed to get recordings:', err);
    res.status(500).json({ error: 'Failed to get recordings' });
  }
});

module.exports = router;
