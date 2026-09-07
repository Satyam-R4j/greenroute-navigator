import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'greenroute_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory User Fallback Cache (ensures registration & login never fail)
const inMemoryUsers = new Map();

// MongoDB Connection Setup
const mongodbUri = process.env.MONGODB_URI || '';

let isDbConnected = false;

if (mongodbUri) {
  mongoose
    .connect(mongodbUri, {
      serverSelectionTimeoutMS: 8000
    })
    .then(() => {
      isDbConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully!');
    })
    .catch((err) => {
      isDbConnected = false;
      console.error('❌ MongoDB Connection Warning:', err.message);
      console.log('💡 Fallback authentication mode ready.');
    });
}

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Auth Middleware to verify JWT Token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      const dbUser = await User.findById(decoded.id).select('-password');
      if (dbUser) {
        req.user = dbUser;
        return next();
      }
    }

    // Check in-memory fallback
    const memUser = inMemoryUsers.get(decoded.email?.toLowerCase());
    if (memUser) {
      req.user = memUser;
      return next();
    }

    return res.status(404).json({ message: 'User account not found' });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired authentication token' });
  }
};

// API ROUTES

// 1. REGISTER USER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    let userId = null;

    // Try MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      try {
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
          return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const newUser = new User({
          name,
          email: cleanEmail,
          password: hashedPassword,
          avatar
        });

        const savedUser = await newUser.save();
        userId = savedUser._id.toString();
      } catch (dbErr) {
        console.warn('⚠️ MongoDB Atlas save failed (using memory store fallback):', dbErr.message);
        if (dbErr.code === 11000) {
          return res.status(409).json({ message: 'An account with this email already exists' });
        }
      }
    }

    // Fallback ID if DB was disconnected or failed
    if (!userId) {
      if (inMemoryUsers.has(cleanEmail)) {
        return res.status(409).json({ message: 'An account with this email already exists' });
      }
      userId = 'usr_' + Math.random().toString(36).substring(2, 9);
      inMemoryUsers.set(cleanEmail, {
        _id: userId,
        id: userId,
        name,
        email: cleanEmail,
        password: hashedPassword,
        avatar
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: userId, email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email: cleanEmail,
        avatar
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    const detail = error && error.message ? error.message : String(error);
    return res.status(500).json({ message: `Registration error: ${detail}` });
  }
});

// 2. LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let foundUser = null;

    // Try MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
      try {
        foundUser = await User.findOne({ email: cleanEmail });
      } catch (dbErr) {
        console.warn('MongoDB query warning:', dbErr.message);
      }
    }

    // Check In-Memory fallback if not found in DB
    if (!foundUser && inMemoryUsers.has(cleanEmail)) {
      foundUser = inMemoryUsers.get(cleanEmail);
    }

    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userId = foundUser._id ? foundUser._id.toString() : foundUser.id;

    // Create JWT Token
    const token = jwt.sign(
      { id: userId, email: cleanEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: userId,
        name: foundUser.name,
        email: cleanEmail,
        avatar: foundUser.avatar
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    const detail = error && error.message ? error.message : String(error);
    return res.status(500).json({ message: `Login error: ${detail}` });
  }
});

// 3. GET CURRENT USER PROFILE
app.get('/api/auth/me', authenticateToken, (req, res) => {
  return res.json({
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected: mongoose.connection.readyState === 1,
    time: new Date()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 GreenRoute Express Server running on http://localhost:${PORT}`);
});
