import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

// Get user history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.history);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add to history
router.post('/history', authMiddleware, async (req, res) => {
  try {
    const { videoId, title, artist, thumbnail } = req.body;
    const user = await User.findById(req.user.id);
    
    // Remove if exists to move to top
    user.history = user.history.filter(h => h.videoId !== videoId);
    user.history.unshift({ videoId, title, artist, thumbnail });
    
    // Keep only last 50
    if (user.history.length > 50) user.history.pop();
    
    await user.save();
    res.json(user.history);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get favorites
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.favorites);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Toggle favorite
router.post('/favorites', authMiddleware, async (req, res) => {
  try {
    const { videoId, title, artist, thumbnail } = req.body;
    const user = await User.findById(req.user.id);
    
    const exists = user.favorites.find(f => f.videoId === videoId);
    if (exists) {
      user.favorites = user.favorites.filter(f => f.videoId !== videoId);
    } else {
      user.favorites.unshift({ videoId, title, artist, thumbnail });
    }
    
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get all playlists
router.get('/playlists', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.playlists);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create a new playlist
router.post('/playlists', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: 'Playlist name is required' });
    
    const user = await User.findById(req.user.id);
    user.playlists.push({ name, tracks: [] });
    await user.save();
    
    // Return the newly created playlist (the last one in the array)
    res.json(user.playlists[user.playlists.length - 1]);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Add a track to a playlist
router.post('/playlists/:id/tracks', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { videoId, title, artist, thumbnail } = req.body;
    
    const user = await User.findById(req.user.id);
    const playlist = user.playlists.id(id);
    
    if (!playlist) return res.status(404).json({ msg: 'Playlist not found' });
    
    // Avoid duplicates
    if (!playlist.tracks.find(t => t.videoId === videoId)) {
        playlist.tracks.push({ videoId, title, artist, thumbnail });
        await user.save();
    }
    
    res.json(playlist);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Remove a track from a playlist
router.delete('/playlists/:id/tracks/:videoId', authMiddleware, async (req, res) => {
  try {
    const { id, videoId } = req.params;
    
    const user = await User.findById(req.user.id);
    const playlist = user.playlists.id(id);
    
    if (!playlist) return res.status(404).json({ msg: 'Playlist not found' });
    
    playlist.tracks = playlist.tracks.filter(t => t.videoId !== videoId);
    await user.save();
    
    res.json(playlist);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

export default router;
