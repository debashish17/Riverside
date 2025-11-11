const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { prisma } = require('../services/database');

// Get JWT secret with fallback
let JWT_SECRET;
try {
  const environment = require('../config/environment');
  JWT_SECRET = environment.getJWTSecret();
} catch (error) {
  JWT_SECRET = process.env.JWT_SECRET || "supersecret";
}

// Create default admin user in database if not exists
async function ensureDefaultUser() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (!adminUser) {
      const hash = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@riverside.com',
          password: hash
        }
      });
      console.log('🔑 Default admin user created: admin/admin123');
    }
  } catch (error) {
    console.error('Error creating default user:', error.message);
  }
}

// Initialize default user
ensureDefaultUser();

async function signup(req, res) {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: "Username and password required",
        message: "Both username and password are required fields"
      });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        error: "Username must be at least 3 characters",
        message: "Username is too short"
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: "Password must be at least 6 characters",
        message: "Password is too weak"
      });
    }
    
    // Check if user already exists in database
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email || undefined }
        ]
      }
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ 
          error: "Username already exists" 
        });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ 
          error: "Email already exists" 
        });
      }
    }
    
    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || `${username}@riverside.local`,
        password: hash
      }
    });
    
    console.log(`👤 New user registered: ${username}`);
    
    return res.status(201).json({ 
      message: "Registration successful",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: "Registration failed",
      message: error.message 
    });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: "Username and password required",
        message: "Both fields are required"
      });
    }
    
    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: "Invalid credentials" 
      });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      return res.status(401).json({ 
        error: "Invalid credentials" 
      });
    }
    
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: "24h" }
    );
    
    console.log(`🔐 User logged in: ${username}`);
    
    return res.json({ 
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      error: "Login failed",
      message: error.message 
    });
  }
}

// Get all users (for debugging)
async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });
    
    res.json({ 
      users,
      total: users.length 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: "Failed to get users",
      message: error.message 
    });
  }
}

module.exports = { signup, login, getUsers };
