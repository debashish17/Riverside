const AWS = require('aws-sdk');
const path = require('path');

class S3Config {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME || 'riverside-recordings';
    this.isConfigured = this.checkConfiguration();
  }

  checkConfiguration() {
    const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`⚠️ S3 Configuration incomplete. Missing: ${missing.join(', ')}`);
      console.warn('📝 S3 uploads will be disabled. Set environment variables to enable.');
      return false;
    }
    
    console.log('✅ S3 Configuration loaded successfully');
    return true;
  }

  isEnabled() {
    return this.isConfigured;
  }

  getClient() {
    return this.s3;
  }

  getBucketName() {
    return this.bucketName;
  }

  generateS3Key(sessionId, filename) {
    const timestamp = new Date().toISOString().split('T')[0];
    return `recordings/${timestamp}/session-${sessionId}/${filename}`;
  }
}

module.exports = new S3Config();