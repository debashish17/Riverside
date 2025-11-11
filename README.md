# Riverside - Video Meeting Application

A modern, feature-rich video meeting application similar to Riverside.fm, built with React and Node.js.

## 🚀 Features

### Core Functionality
- **Real-time Video Meetings**: WebRTC-powered video calls with multiple participants
- **Session Management**: Create, join, and manage video sessions
- **Automatic Recording**: Background recording during sessions with local/cloud storage
- **User Authentication**: Secure JWT-based authentication system
- **Project Organization**: Organize recordings by projects
- **File Management**: Upload and manage video recordings

### Technical Features
- **WebRTC Integration**: Direct peer-to-peer communication
- **Socket.IO Signaling**: Real-time signaling for WebRTC connections
- **Cloud Storage**: AWS S3 integration for scalable storage
- **Database**: PostgreSQL with Prisma ORM
- **Docker Support**: Full containerization with Docker Compose
- **Health Monitoring**: Comprehensive health checks and metrics

## 🏗️ Architecture

### Frontend (React)
- **Components**: Modular React components with hooks
- **State Management**: Context API for global state
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **Media Handling**: MediaRecorder API for recording

### Backend (Node.js)
- **API Server**: Express.js REST API
- **Real-time**: Socket.IO for WebRTC signaling
- **Database**: Prisma ORM with PostgreSQL
- **Storage**: Local filesystem + AWS S3
- **Authentication**: JWT tokens with bcrypt hashing

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher
- PostgreSQL 15.x (optional, uses file storage as fallback)
- Docker & Docker Compose (for containerized deployment)
- AWS Account (optional, for cloud storage)

## 🛠️ Installation

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/riverside.git
   cd riverside
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Database Setup (Optional)**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

### Docker Deployment

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Start All Services**
   ```bash
   docker-compose up -d
   ```

3. **Initialize Database**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Backend server port | `5000` | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `DATABASE_URL` | PostgreSQL connection | - | Yes* |
| `AWS_ACCESS_KEY_ID` | AWS access key | - | No |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - | No |
| `S3_BUCKET_NAME` | S3 bucket name | - | No |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:3000` | No |

*Required for database features, optional for file-based storage

### AWS S3 Setup (Optional)

1. Create an S3 bucket
2. Configure IAM user with S3 permissions
3. Add AWS credentials to `.env`
4. Recordings will automatically upload to S3

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Session Management
- `GET /session` - List active sessions
- `POST /session` - Create new session
- `DELETE /session/:id` - End session

### Recording Management
- `GET /recordings` - List recordings
- `POST /recordings` - Upload recording
- `DELETE /recordings/:id` - Delete recording

### Project Management
- `GET /projects` - List projects
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Health & Monitoring
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status
- `GET /health/metrics` - System metrics

## 🎮 Usage

### Creating a Session
1. Register/Login to your account
2. Navigate to Dashboard
3. Click "Create Session"
4. Enter session name and project
5. Share session ID with participants

### Joining a Session
1. Enter session ID on join page
2. Provide your username
3. Allow camera/microphone permissions
4. Start video call

### Recording Management
- Recordings start automatically when session begins
- Recordings are saved when session ends
- Access recordings from project dashboard
- Download or stream recordings

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🚀 Deployment

### Production Deployment with Docker

1. **Build Production Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to Server**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Setup SSL (Recommended)**
   - Use nginx-proxy or similar for SSL termination
   - Configure domain names and certificates

### Cloud Deployment

#### AWS ECS/Fargate
- Use provided Dockerfile for container deployment
- Configure RDS for PostgreSQL
- Use S3 for file storage

#### Kubernetes
- Kubernetes manifests available in `/k8s` directory
- Configure ingress for external access
- Use persistent volumes for storage

## 🔧 Development

### Project Structure
```
riverside/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # Context providers
│   │   └── utils/         # Utility functions
│   └── public/
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── validation/    # Input validation
│   ├── routes/            # Legacy routes (to be migrated)
│   └── prisma/            # Database schema
└── docker-compose.yml     # Docker services
```

### Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Conventional commits for commit messages

## 📊 Monitoring

### Health Checks
- Application health: `GET /health`
- Database connectivity: `GET /health/database`
- System metrics: `GET /health/metrics`

### Logging
- Structured logging with timestamps
- Request/response logging
- Error tracking and reporting

### Performance
- WebRTC connection quality monitoring
- API response time tracking
- Resource usage metrics

## 🔒 Security

### Authentication & Authorization
- JWT tokens with secure secret
- Password hashing with bcrypt
- Role-based access control

### Data Protection
- HTTPS enforcement in production
- CORS protection
- Input validation and sanitization
- SQL injection prevention with Prisma

### Privacy
- Recordings stored securely
- User data encryption
- GDPR compliance considerations

## 🐛 Troubleshooting

### Common Issues

**Connection Issues**
- Check TURN server configuration for NAT traversal
- Verify firewall settings for WebRTC ports
- Ensure proper CORS configuration

**Recording Issues**
- Verify browser supports MediaRecorder API
- Check microphone/camera permissions
- Ensure sufficient storage space

**Database Issues**
- Verify DATABASE_URL configuration
- Check PostgreSQL service status
- Run database migrations

### Performance Optimization

- Use TURN server for better connectivity
- Configure S3 for scalable storage
- Implement CDN for static assets
- Use Redis for session caching

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- Create an issue for bugs or feature requests
- Join our Discord community
- Check the documentation wiki
- Email support: support@riverside.example.com

## 🙏 Acknowledgments

- Inspired by Riverside.fm
- Built with amazing open-source technologies
- Thanks to the WebRTC community
- Special thanks to all contributors

---

**Made with ❤️ by the Riverside Team**