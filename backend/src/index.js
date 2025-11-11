
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require('fs');

// Import configuration and middleware (with fallbacks)
let environment;
try {
  environment = require('./config/environment');
} catch (error) {
  console.warn('⚠️ Environment config not found, using defaults');
  environment = {
    env: 'development',
    getAppConfig: () => ({ corsOrigin: 'http://localhost:3000' }),
    getJWTSecret: () => process.env.JWT_SECRET || 'your-secret-key'
  };
}

let databaseConfig;
try {
  const { connectDatabase, disconnectDatabase, prisma } = require('./services/database');
  databaseConfig = {
    connect: connectDatabase,
    disconnect: disconnectDatabase,
    getClient: () => prisma
  };
} catch (error) {
  console.warn('⚠️ Database service not found, using defaults');
  databaseConfig = {
    connect: async () => { console.log('📄 Using file-based storage'); return false; },
    disconnect: async () => {},
    getClient: () => null
  };
}

let ErrorHandler;
try {
  ErrorHandler = require('./middleware/errorHandler');
} catch (error) {
  console.warn('⚠️ Error handler not found, using basic error handling');
  ErrorHandler = {
    notFound: (req, res) => res.status(404).json({ error: 'Route not found' }),
    global: (err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error', message: err.message });
    },
    async: (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
  };
};

const AuthMiddleware = require('./middleware/auth');

// Import routes (with proper error handling)
const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/user.js");
const sessionRoutes = require("./routes/session.js");
const recordingsRoute = require("./routes/recordings");

// Import new routes if they exist
let projectRoutes;
try {
  projectRoutes = require('./routes/project');
} catch (error) {
  console.warn('⚠️ Project routes not available');
  projectRoutes = null;
}

let healthRoutes;
try {
  healthRoutes = require('./routes/health');
} catch (error) {
  console.warn('⚠️ Health routes not available');
  healthRoutes = null;
}

const app = express();
const server = http.createServer(app);

// Enhanced Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: environment ? environment.getAppConfig().corsOrigin : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Enhanced middleware setup
app.use(cors({
  origin: environment ? environment.getAppConfig().corsOrigin : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📡 ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health check routes (if available)
if (healthRoutes) {
  app.use('/health', healthRoutes);
} else {
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
}

// API routes with proper prefixes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/recordings", recordingsRoute);

// New routes if available
if (projectRoutes) {
  app.use('/api/projects', AuthMiddleware.authenticate, projectRoutes);
}

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Riverside Backend API',
    version: process.env.npm_package_version || '1.0.0',
    environment: environment ? environment.env : 'development',
    endpoints: {
      auth: '/api/auth (POST /login, POST /register)',
      sessions: '/api/session (GET, POST, DELETE)',
      recordings: '/api/recordings (GET, POST)',
      users: '/api/user (GET, PUT)',
      projects: '/api/projects (GET, POST, PUT, DELETE) - if available',
      health: '/health (GET /health)'
    },
    websocket: {
      endpoint: '/socket.io',
      events: ['join-room', 'signal', 'disconnect']
    }
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Riverside-like backend is running!",
    version: '1.0.0',
    status: 'healthy',
    endpoints: {
      api: '/api',
      health: '/health',
      socket: '/socket.io'
    }
  });
});

// Enhanced WebRTC signaling events
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Legacy support for existing frontend
  socket.on("join-room", ({ roomId }) => {
    console.log(`👤 Socket ${socket.id} joining room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", { userId: socket.id });
  });

  socket.on("signal", ({ roomId, data }) => {
    console.log(`📤 Signal from ${socket.id} in room ${roomId}`);
    socket.to(roomId).emit("signal", { userId: socket.id, data });
  });

  // New session-based events
  socket.on('join-session', (sessionId) => {
    console.log(`👤 Socket ${socket.id} joining session ${sessionId}`);
    socket.join(sessionId);
    socket.to(sessionId).emit('user-joined', socket.id);
  });
  
  socket.on('leave-session', (sessionId) => {
    console.log(`👋 Socket ${socket.id} leaving session ${sessionId}`);
    socket.leave(sessionId);
    socket.to(sessionId).emit('user-left', socket.id);
  });
  
  socket.on('offer', (data) => {
    console.log(`📤 Offer from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });
  
  socket.on('answer', (data) => {
    console.log(`📥 Answer from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });
  
  socket.on('ice-candidate', (data) => {
    console.log(`🧊 ICE candidate from ${socket.id} to ${data.target}`);
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Error handling middleware (if available)
if (ErrorHandler) {
  app.use(ErrorHandler.notFound);
  app.use(ErrorHandler.global);
} else {
  // Basic error handling
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.originalUrl });
  });
  
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });
}

const PORT = process.env.PORT || 5000;

// Enhanced server startup
const startServer = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎬 Starting Riverside Backend Server...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Connect to database using Prisma
    try {
      const { connectDatabase } = require('./services/database');
      const connected = await connectDatabase();
      if (connected) {
        console.log('🗄️ PostgreSQL database connection established via Prisma');
      }
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      console.warn('⚠️ Server will start but database features may not work');
    }
    
    server.listen(PORT, () => {
      console.log('🚀 Riverside Backend Server Started!');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${environment ? environment.env : 'development'}`);
      console.log(`🔗 CORS enabled for: ${environment ? environment.getAppConfig().corsOrigin : 'http://localhost:3000'}`);
      console.log(`📁 Upload directory: ${uploadsDir}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  
  // Disconnect database if connected
  try {
    const { disconnectDatabase } = require('./services/database');
    await disconnectDatabase();
  } catch (error) {
    console.warn('⚠️ Error disconnecting database:', error.message);
  }
  
  server.close(() => {
    console.log('🔌 HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  
  // Disconnect database if connected
  try {
    const { disconnectDatabase } = require('./services/database');
    await disconnectDatabase();
  } catch (error) {
    console.warn('⚠️ Error disconnecting database:', error.message);
  }
  
  server.close(() => {
    console.log('🔌 HTTP server closed');
    process.exit(0);
  });
});

startServer();
