import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.js';
import musicRoutes from './routes/music.js';
import libraryRoutes from './routes/library.js';

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/library', libraryRoutes);

app.get('/', (req, res) => {
  res.send('Music Streaming API is running...');
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables!');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error.message));
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Deployment status: Listening for requests...');
});
