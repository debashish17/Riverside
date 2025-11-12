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
        id: Date.now(), // Generate unique ID
        filename: file.filename, // filename now always includes extension
        originalname: file.originalname,
        sessionId: sessionId,
        sessionName: sessionName || `Session ${sessionId}`,
        uploadedAt: new Date(),
        size: file.size,
        type: 'session-recording',
        uploadMethod: 'direct'
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
      id: Date.now(), // Generate unique ID
      filename: file.filename, // filename now always includes extension
      originalname: file.originalname,
      projectId,
      uploadedAt: new Date(),
      size: file.size,
      uploadMethod: 'direct'
    };

    // Add session information if provided
    if (sessionId) {
      uploadInfo.sessionId = sessionId;
      uploadInfo.sessionName = sessionName || `Session ${sessionId}`;
      uploadInfo.type = 'session-recording';
      console.log(`Recording uploaded for session ${sessionId} (${sessionName}):`, file.originalname);
    } else {
      uploadInfo.type = 'manual-recording';
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
          id: metadata?.id || Date.now() + Math.random(), // Ensure ID is always present
          filename,
          originalname: metadata?.originalname || filename,
          projectId: metadata?.projectId || 1,
          sessionId: metadata?.sessionId,
          sessionName: metadata?.sessionName,
          uploadedAt: metadata?.uploadedAt || stats.birthtime,
          size: metadata?.size || stats.size,
          type: metadata?.type || 'unknown',
          uploadMethod: metadata?.uploadMethod || 'legacy',
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

// DELETE /api/recordings/:id - delete a recording
router.delete('/:id', (req, res) => {
  try {
    const recordingId = req.params.id;

    // Find recording in metadata
    const recordingIndex = recordingsMetadata.findIndex(r => String(r.id) === String(recordingId));

    if (recordingIndex === -1) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    const recording = recordingsMetadata[recordingIndex];

    // Delete the file from disk
    const filePath = path.join(__dirname, '../../uploads', recording.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted file: ${recording.filename}`);
    }

    // Remove from metadata
    recordingsMetadata.splice(recordingIndex, 1);
    saveMetadata();

    console.log(`✅ Recording ${recordingId} deleted successfully`);
    res.json({
      success: true,
      message: 'Recording deleted successfully',
      id: recordingId
    });
  } catch (err) {
    console.error('❌ Failed to delete recording:', err);
    res.status(500).json({ error: 'Failed to delete recording' });
  }
});

// Chunked upload endpoints
const chunkedUploads = new Map(); // Store upload session info in memory

// POST /api/recordings/upload/init - Initialize chunked upload
router.post('/upload/init', async (req, res) => {
  try {
    const { sessionId, sessionName, totalChunks, totalSize, filename } = req.body;

    if (!totalChunks || !totalSize || !filename) {
      return res.status(400).json({ error: 'Missing required fields: totalChunks, totalSize, filename' });
    }

    // Generate unique upload ID
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create upload session
    const uploadSession = {
      uploadId,
      sessionId,
      sessionName,
      filename,
      totalChunks: parseInt(totalChunks),
      totalSize: parseInt(totalSize),
      chunksReceived: [],
      createdAt: new Date(),
      chunksDir: path.join(__dirname, `../../uploads/chunks/${uploadId}`)
    };

    // Create chunks directory
    if (!fs.existsSync(uploadSession.chunksDir)) {
      fs.mkdirSync(uploadSession.chunksDir, { recursive: true });
    }

    chunkedUploads.set(uploadId, uploadSession);

    console.log(`📦 Chunked upload initialized: ${uploadId} (${totalChunks} chunks, ${(totalSize / 1024 / 1024).toFixed(2)} MB)`);

    res.json({
      success: true,
      uploadId,
      message: 'Chunked upload initialized'
    });
  } catch (err) {
    console.error('❌ Failed to initialize chunked upload:', err);
    res.status(500).json({ error: 'Failed to initialize chunked upload' });
  }
});

// POST /api/recordings/upload/chunk - Upload a single chunk
router.post('/upload/chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { uploadId, chunkIndex } = req.body;
    const file = req.file;

    if (!uploadId || chunkIndex === undefined || !file) {
      return res.status(400).json({ error: 'Missing required fields: uploadId, chunkIndex, chunk file' });
    }

    const uploadSession = chunkedUploads.get(uploadId);
    if (!uploadSession) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    // Move chunk to chunks directory with proper name
    const chunkPath = path.join(uploadSession.chunksDir, `chunk-${chunkIndex}`);
    fs.renameSync(file.path, chunkPath);

    // Track received chunk
    uploadSession.chunksReceived.push(parseInt(chunkIndex));
    uploadSession.chunksReceived.sort((a, b) => a - b);

    console.log(`📦 Chunk ${parseInt(chunkIndex) + 1}/${uploadSession.totalChunks} received for ${uploadId}`);

    res.json({
      success: true,
      chunkIndex: parseInt(chunkIndex),
      chunksReceived: uploadSession.chunksReceived.length,
      totalChunks: uploadSession.totalChunks,
      message: `Chunk ${parseInt(chunkIndex) + 1}/${uploadSession.totalChunks} uploaded`
    });
  } catch (err) {
    console.error('❌ Failed to upload chunk:', err);
    res.status(500).json({ error: 'Failed to upload chunk' });
  }
});

// POST /api/recordings/upload/complete - Complete chunked upload and assemble
router.post('/upload/complete', async (req, res) => {
  try {
    const { uploadId } = req.body;

    if (!uploadId) {
      return res.status(400).json({ error: 'Missing uploadId' });
    }

    const uploadSession = chunkedUploads.get(uploadId);
    if (!uploadSession) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    // Verify all chunks received
    if (uploadSession.chunksReceived.length !== uploadSession.totalChunks) {
      return res.status(400).json({
        error: 'Not all chunks received',
        received: uploadSession.chunksReceived.length,
        expected: uploadSession.totalChunks
      });
    }

    console.log(`🔧 Assembling ${uploadSession.totalChunks} chunks for ${uploadId}...`);

    // Assemble chunks into final file
    const finalFilename = uploadSession.filename || `recording-${Date.now()}.webm`;
    const finalPath = path.join(__dirname, '../../uploads', finalFilename);
    const writeStream = fs.createWriteStream(finalPath);

    // Write chunks in order
    for (let i = 0; i < uploadSession.totalChunks; i++) {
      const chunkPath = path.join(uploadSession.chunksDir, `chunk-${i}`);
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
    }

    writeStream.end();

    // Wait for write to complete
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Get file stats
    const stats = fs.statSync(finalPath);

    console.log(`✅ File assembled: ${finalFilename} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

    // Save metadata
    const uploadInfo = {
      id: Date.now(), // Generate unique ID
      filename: finalFilename,
      originalname: uploadSession.filename,
      sessionId: uploadSession.sessionId,
      sessionName: uploadSession.sessionName || `Session ${uploadSession.sessionId}`,
      uploadedAt: new Date(),
      size: stats.size,
      type: 'session-recording',
      uploadMethod: 'chunked'
    };

    recordingsMetadata.push(uploadInfo);
    saveMetadata();

    // Clean up chunks directory
    try {
      fs.rmSync(uploadSession.chunksDir, { recursive: true, force: true });
      console.log(`🗑️ Cleaned up chunks directory for ${uploadId}`);
    } catch (cleanupErr) {
      console.warn('⚠️ Failed to clean up chunks directory:', cleanupErr);
    }

    // Remove upload session
    chunkedUploads.delete(uploadId);

    res.json({
      success: true,
      message: 'Recording assembled and saved successfully',
      ...uploadInfo
    });
  } catch (err) {
    console.error('❌ Failed to complete chunked upload:', err);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
});

module.exports = router;
