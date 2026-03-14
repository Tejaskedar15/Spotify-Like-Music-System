import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  history: [{
    videoId: String,
    title: String,
    artist: String,
    thumbnail: String,
    playedAt: { type: Date, default: Date.now }
  }],
  favorites: [{
    videoId: String,
    title: String,
    artist: String,
    thumbnail: String
  }],
  playlists: [{
    name: String,
    tracks: [{
      videoId: String,
      title: String,
      artist: String,
      thumbnail: String
    }]
  }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
