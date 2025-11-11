const s3Config = require('../config/s3');
const fs = require('fs');
const path = require('path');

class S3Service {
  constructor() {
    this.s3 = s3Config.getClient();
    this.bucketName = s3Config.getBucketName();
    this.isEnabled = s3Config.isEnabled();
  }

  async uploadFile(filePath, sessionId, originalName) {
    if (!this.isEnabled) {
      throw new Error('S3 is not configured. Upload to local storage instead.');
    }

    try {
      const fileContent = fs.readFileSync(filePath);
      const s3Key = s3Config.generateS3Key(sessionId, originalName);
      
      const params = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: this.getContentType(originalName),
        Metadata: {
          sessionId: sessionId.toString(),
          uploadedAt: new Date().toISOString(),
          originalName: originalName
        }
      };

      const result = await this.s3.upload(params).promise();
      
      console.log(`✅ File uploaded to S3: ${s3Key}`);
      
      return {
        url: result.Location,
        key: s3Key,
        bucket: this.bucketName,
        size: fileContent.length,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('❌ S3 upload failed:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async downloadFile(s3Key, localPath) {
    if (!this.isEnabled) {
      throw new Error('S3 is not configured');
    }

    try {
      const params = {
        Bucket: this.bucketName,
        Key: s3Key
      };

      const data = await this.s3.getObject(params).promise();
      fs.writeFileSync(localPath, data.Body);
      
      console.log(`✅ File downloaded from S3: ${s3Key}`);
      return localPath;
    } catch (error) {
      console.error('❌ S3 download failed:', error);
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  async deleteFile(s3Key) {
    if (!this.isEnabled) {
      return { success: true, message: 'S3 not configured, nothing to delete' };
    }

    try {
      const params = {
        Bucket: this.bucketName,
        Key: s3Key
      };

      await this.s3.deleteObject(params).promise();
      console.log(`✅ File deleted from S3: ${s3Key}`);
      
      return { success: true, key: s3Key };
    } catch (error) {
      console.error('❌ S3 delete failed:', error);
      throw new Error(`S3 delete failed: ${error.message}`);
    }
  }

  async listFiles(prefix = 'recordings/') {
    if (!this.isEnabled) {
      return [];
    }

    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix
      };

      const data = await this.s3.listObjectsV2(params).promise();
      return data.Contents || [];
    } catch (error) {
      console.error('❌ S3 list failed:', error);
      throw new Error(`S3 list failed: ${error.message}`);
    }
  }

  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.webm': 'video/webm',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/avi',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  generateSignedUrl(s3Key, expiresIn = 3600) {
    if (!this.isEnabled) {
      throw new Error('S3 is not configured');
    }

    const params = {
      Bucket: this.bucketName,
      Key: s3Key,
      Expires: expiresIn
    };

    return this.s3.getSignedUrl('getObject', params);
  }
}

module.exports = new S3Service();