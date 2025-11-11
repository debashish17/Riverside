const s3Service = require('./s3Service');
const { prisma } = require('./database');
const fs = require('fs');
const path = require('path');

class RecordingService {
  constructor() {
    this.prisma = prisma;
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  async processRecording(file, sessionId, sessionName, projectId) {
    try {
      const recordingData = {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        sessionId: sessionId ? parseInt(sessionId) : null,
        sessionName: sessionName || null,
        projectId: parseInt(projectId),
        uploadedAt: new Date(),
        localPath: file.path,
        status: 'processing'
      };

      // Try to upload to S3 if configured
      if (s3Service.isEnabled) {
        try {
          const s3Result = await s3Service.uploadFile(
            file.path, 
            sessionId || 'manual', 
            file.originalname
          );
          
          recordingData.s3Url = s3Result.url;
          recordingData.s3Key = s3Result.key;
          recordingData.status = 'completed';
          recordingData.storageType = 'cloud';
          
          console.log('✅ Recording uploaded to S3:', s3Result.url);
        } catch (s3Error) {
          console.warn('⚠️ S3 upload failed, keeping local copy:', s3Error.message);
          recordingData.status = 'local_only';
          recordingData.storageType = 'local';
        }
      } else {
        recordingData.status = 'completed';
        recordingData.storageType = 'local';
        console.log('📁 Recording stored locally (S3 not configured)');
      }

      // Save metadata to database if available, otherwise use JSON file
      let savedRecording;
      try {
        savedRecording = await this.saveToDatabase(recordingData);
        console.log('✅ Recording metadata saved to database');
      } catch (dbError) {
        console.warn('⚠️ Database save failed, using file storage:', dbError.message);
        savedRecording = await this.saveToFile(recordingData);
      }

      return {
        success: true,
        recording: savedRecording,
        message: sessionId ? 'Session recording saved' : 'Recording uploaded'
      };
    } catch (error) {
      console.error('❌ Recording processing failed:', error);
      throw new Error(`Recording processing failed: ${error.message}`);
    }
  }

  async saveToDatabase(recordingData) {
    try {
      // First ensure the project exists
      const project = await this.prisma.project.upsert({
        where: { id: recordingData.projectId },
        update: {},
        create: {
          id: recordingData.projectId,
          name: `Project ${recordingData.projectId}`,
          owner: 'system'
        }
      });

      // Save the recording
      const recording = await this.prisma.recording.create({
        data: {
          filename: recordingData.filename,
          originalName: recordingData.originalname,
          filePath: recordingData.localPath,
          s3Url: recordingData.s3Url,
          s3Key: recordingData.s3Key,
          size: recordingData.size,
          sessionId: recordingData.sessionId,
          sessionName: recordingData.sessionName,
          status: recordingData.status,
          storageType: recordingData.storageType,
          projectId: recordingData.projectId,
          uploadedAt: recordingData.uploadedAt
        }
      });

      return recording;
    } catch (error) {
      throw new Error(`Database save failed: ${error.message}`);
    }
  }

  async saveToFile(recordingData) {
    const metadataFile = path.join(this.uploadsDir, 'recordings-metadata.json');
    
    try {
      let metadata = [];
      if (fs.existsSync(metadataFile)) {
        const data = fs.readFileSync(metadataFile, 'utf8');
        metadata = JSON.parse(data);
      }

      const recordingEntry = {
        id: Date.now(),
        ...recordingData,
        createdAt: recordingData.uploadedAt
      };

      metadata.push(recordingEntry);
      
      // Ensure uploads directory exists
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }
      
      fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
      return recordingEntry;
    } catch (error) {
      throw new Error(`File save failed: ${error.message}`);
    }
  }

  async getAllRecordings() {
    try {
      // Try database first
      const recordings = await this.prisma.recording.findMany({
        include: {
          project: true
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
      
      return recordings;
    } catch (dbError) {
      console.warn('⚠️ Database query failed, using file storage:', dbError.message);
      return this.getRecordingsFromFile();
    }
  }

  async getRecordingsFromFile() {
    const metadataFile = path.join(this.uploadsDir, 'recordings-metadata.json');
    
    try {
      if (!fs.existsSync(metadataFile)) {
        return [];
      }
      
      const data = fs.readFileSync(metadataFile, 'utf8');
      const metadata = JSON.parse(data);
      
      return metadata.sort((a, b) => 
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );
    } catch (error) {
      console.error('❌ Failed to read recordings metadata:', error);
      return [];
    }
  }

  async deleteRecording(recordingId) {
    try {
      // Try database first
      const recording = await this.prisma.recording.findUnique({
        where: { id: parseInt(recordingId) }
      });
      
      if (recording) {
        // Delete from S3 if exists
        if (recording.s3Key) {
          await s3Service.deleteFile(recording.s3Key);
        }
        
        // Delete local file if exists
        if (recording.filePath && fs.existsSync(recording.filePath)) {
          fs.unlinkSync(recording.filePath);
        }
        
        // Delete from database
        await this.prisma.recording.delete({
          where: { id: parseInt(recordingId) }
        });
        
        return { success: true, message: 'Recording deleted successfully' };
      }
    } catch (dbError) {
      console.warn('⚠️ Database delete failed, trying file storage:', dbError.message);
      // Fallback to file-based deletion
      return this.deleteRecordingFromFile(recordingId);
    }
  }

  async deleteRecordingFromFile(recordingId) {
    // Implementation for file-based deletion
    // This would be more complex and is left as an exercise
    throw new Error('File-based deletion not implemented');
  }
}

module.exports = new RecordingService();