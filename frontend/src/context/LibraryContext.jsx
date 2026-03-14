import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const LibraryContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const LibraryProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE_URL}/api/library/favorites`)
        .then(res => setFavorites(res.data))
        .catch(err => console.error(err));

      axios.get(`${API_BASE_URL}/api/library/playlists`)
        .then(res => setPlaylists(res.data))
        .catch(err => console.error(err));
    } else {
      setFavorites([]);
      setPlaylists([]);
    }
  }, [token]);

  const toggleFavorite = async (track) => {
    if (!token || !track || !track.videoId) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/library/favorites`, {
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail
      });
      setFavorites(res.data);
    } catch (err) {
      console.error('Failed to toggle favorite:', err.response?.data || err.message);
    }
  };

  const isFavorite = (videoId) => {
    if (!videoId) return false;
    return favorites.some(f => f.videoId === videoId);
  };

  const createPlaylist = async (name) => {
    if (!token) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/library/playlists`, { name });
      setPlaylists(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const addTrackToPlaylist = async (playlistId, track) => {
    if (!token || !track || !track.videoId) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/library/playlists/${playlistId}/tracks`, {
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail
      });
      setPlaylists(prev => prev.map(p => p._id === playlistId ? res.data : p));
    } catch (err) {
      console.error('Failed to add to playlist:', err);
    }
  };

  const removeTrackFromPlaylist = async (playlistId, videoId) => {
    if (!token) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/library/playlists/${playlistId}/tracks/${videoId}`);
      setPlaylists(prev => prev.map(p => p._id === playlistId ? res.data : p));
    } catch (err) {
      console.error('Failed to remove from playlist:', err);
    }
  };

  return (
    <LibraryContext.Provider value={{ favorites, toggleFavorite, isFavorite, playlists, createPlaylist, addTrackToPlaylist, removeTrackFromPlaylist }}>
      {children}
    </LibraryContext.Provider>
  );
};
