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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
