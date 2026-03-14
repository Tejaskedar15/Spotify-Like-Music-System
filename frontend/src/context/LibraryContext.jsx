import { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const LibraryContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const LibraryProvider = ({ children }) => {
  const { token, loading: authLoading } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  // Queue actions that were triggered before auth was ready
  const pendingAction = useRef(null);

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE_URL}/api/library/favorites`)
        .then(res => setFavorites(res.data))
        .catch(err => console.error(err));

      axios.get(`${API_BASE_URL}/api/library/playlists`)
        .then(res => setPlaylists(res.data))
        .catch(err => console.error(err));

      // Run any queued action after auth completes
      if (pendingAction.current) {
        pendingAction.current();
        pendingAction.current = null;
      }
    } else {
      setFavorites([]);
      setPlaylists([]);
    }
  }, [token]);

  const toggleFavorite = async (track) => {
    if (!track || !track.videoId) return;
    if (!token) {
      // Queue the action and wait for auth
      pendingAction.current = () => toggleFavorite(track);
      return;
    }
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
    if (!token) {
      pendingAction.current = () => createPlaylist(name);
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/library/playlists`, { name });
      setPlaylists([...playlists, res.data]);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const addTrackToPlaylist = async (playlistId, track) => {
    if (!token) return;
    if (!track || !track.videoId) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/library/playlists/${playlistId}/tracks`, {
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail
      });
      setPlaylists(playlists.map(p => p._id === playlistId ? res.data : p));
      alert(`Added to playlist!`);
    } catch (err) {
      console.error('Failed to add to playlist:', err);
    }
  };

  const removeTrackFromPlaylist = async (playlistId, videoId) => {
    if (!token) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/library/playlists/${playlistId}/tracks/${videoId}`);
      setPlaylists(playlists.map(p => p._id === playlistId ? res.data : p));
    } catch (err) {
      console.error('Failed to remove from playlist:', err);
    }
  };

  return (
    <LibraryContext.Provider value={{ favorites, toggleFavorite, isFavorite, playlists, createPlaylist, addTrackToPlaylist, removeTrackFromPlaylist, authLoading }}>
      {children}
    </LibraryContext.Provider>
  );
};
