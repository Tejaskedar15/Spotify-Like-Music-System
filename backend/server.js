import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow all origins (required for Vercel frontend to talk to Render backend)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));
app.use(express.json());

import authRoutes from './routes/auth.js';
import musicRoutes from './routes/music.js';
import libraryRoutes from './routes/library.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/library', libraryRoutes);

app.get('/', (req, res) => {
  res.send('Music Streaming API is running...');
});

// Ensure guest user always exists in the database
const ensureGuestUser = async () => {
  try {
    const existing = await User.findOne({ email: 'guest@vibestream.com' });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('guestpassword', salt);
      await User.create({ username: 'Guest', email: 'guest@vibestream.com', password: hashedPassword });
      console.log('Guest user created successfully');
    } else {
      console.log('Guest user already exists');
    }
  } catch (err) {
    console.error('Failed to ensure guest user:', err.message);
  }
};

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables!');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      ensureGuestUser(); // Create guest user on startup
    })
    .catch((error) => console.error('Error connecting to MongoDB:', error.message));
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Deployment status: Listening for requests...');
});
