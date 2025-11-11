require('dotenv').config();

class EnvironmentConfig {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || 5000;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.databaseUrl = process.env.DATABASE_URL;
    
    // AWS Configuration
    this.aws = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucketName: process.env.S3_BUCKET_NAME || 'riverside-recordings'
    };
    
    // TURN Server Configuration
    this.turn = {
      urls: process.env.TURN_URLS ? process.env.TURN_URLS.split(',') : [],
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL
    };
    
    // Application Settings
    this.app = {
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      uploadDir: process.env.UPLOAD_DIR || 'uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 24 * 60 * 60 * 1000 // 24 hours
    };
    
    this.validateRequired();
  }

  validateRequired() {
    const required = {
      JWT_SECRET: this.jwtSecret,
      DATABASE_URL: this.databaseUrl
    };
    
    const missing = Object.entries(required)
      .filter(([key, value]) => !value || value === 'your-secret-key')
      .map(([key]) => key);
    
    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
      if (this.env === 'production') {
        process.exit(1);
      }
    }
  }

  isDevelopment() {
    return this.env === 'development';
  }

  isProduction() {
    return this.env === 'production';
  }

  getPort() {
    return this.port;
  }

  getJWTSecret() {
    return this.jwtSecret;
  }

  getDatabaseUrl() {
    return this.databaseUrl;
  }

  getAWSConfig() {
    return this.aws;
  }

  getTURNConfig() {
    return this.turn;
  }

  getAppConfig() {
    return this.app;
  }
}

module.exports = new EnvironmentConfig();