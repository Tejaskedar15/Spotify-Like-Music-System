import express from 'express';
import yts from 'yt-search';

const router = express.Router();

// Search for songs via yt-search
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ msg: 'Query is required' });

    const r = await yts(query);
    const videos = r.videos.slice(0, 10).map(v => ({
      videoId: v.videoId,
      title: v.title,
      artist: v.author.name,
      thumbnail: v.thumbnail,
      duration: v.timestamp
    }));

    res.json(videos);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).send('Server error');
  }
});

let cachedMixes = null;
let lastMixFetchHour = null;

// Get Mixes for home page
router.get('/mixes', async (req, res) => {
  try {
    const currentHour = new Date().getHours();
    if (cachedMixes && lastMixFetchHour === currentHour) {
       return res.json(cachedMixes);
    }

    // Generate some random mix keywords
    const mixKeywords = ['lofi hip hop', 'pop hits 2026', 'workout motivation mix', 'chill vibes mix', 'late night drive music', 'top acoustic songs'];
    
    // Pick 6 random mixes
    const selectedMixes = mixKeywords.sort(() => 0.5 - Math.random()).slice(0, 6);
    
    const mixesPromises = selectedMixes.map(async (keyword) => {
      const r = await yts(keyword);
      if (r.videos.length > 0) {
        const v = r.videos[0]; // Get the top playlist or video for this mix pattern
        return {
          id: keyword,
          title: keyword.replace(/\b\w/g, l => l.toUpperCase()), // capitalize
          videoId: v.videoId,
          artist: v.author.name,
          thumbnail: v.thumbnail,
          duration: v.timestamp
        };
      }
      return null;
    });

    let mixes = await Promise.all(mixesPromises);
    mixes = mixes.filter(m => m !== null);
    
    cachedMixes = mixes;
    lastMixFetchHour = currentHour;

    res.json(mixes);
  } catch (err) {
    console.error('Mix error:', err.message);
    res.status(500).send('Server error');
  }
});

import { authMiddleware } from './auth.js';
import User from '../models/User.js';

// Get Recommendations based on history
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let searchKeyword = 'top global songs'; // fallback
    
    if (user && user.history && user.history.length > 0) {
      // Pick a random recently played artist or title to seed recommendations
      const recentSong = user.history[Math.floor(Math.random() * Math.min(5, user.history.length))];
      searchKeyword = `similar to ${recentSong.artist} ${recentSong.title}`;
    }

    const r = await yts(searchKeyword);
    const videos = r.videos.slice(0, 10).map(v => ({
      videoId: v.videoId,
      title: v.title,
      artist: v.author.name,
      thumbnail: v.thumbnail,
      duration: v.timestamp
    }));

    res.json(videos);
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
