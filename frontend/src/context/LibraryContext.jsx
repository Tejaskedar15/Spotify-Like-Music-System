import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const LibraryContext = createContext();

export const LibraryProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/api/library/favorites')
        .then(res => setFavorites(res.data))
        .catch(err => console.error(err));
        
      axios.get('http://localhost:5000/api/library/playlists')
        .then(res => setPlaylists(res.data))
        .catch(err => console.error(err));
    } else {
      setFavorites([]);
      setPlaylists([]);
    }
  }, [token]);

  const toggleFavorite = async (track) => {
    if (!token) {
        console.log('toggleFavorite failed: no token found');
        return alert('Please login to save favorites');
    }
    try {
      if (!track || !track.videoId) {
          console.error('toggleFavorite failed: Invalid track object passed:', track);
          return;
      }
      console.log('Toggling favorite for:', track.videoId, track.title);
      const res = await axios.post('http://localhost:5000/api/library/favorites', {
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail
      });
      console.log('Favorites updated from backend:', res.data);
      setFavorites(res.data);
    } catch (err) {
      console.error('Failed to toggle favorite HTTP request:', err.response?.data || err.message);
    }
  };

  const isFavorite = (videoId) => {
    if (!videoId) return false;
    const result = favorites.some(f => f.videoId === videoId);
    return result;
  };
  
  const createPlaylist = async (name) => {
    if (!token) return alert('Please login to create a playlist');
    try {
      const res = await axios.post('http://localhost:5000/api/library/playlists', { name });
      setPlaylists([...playlists, res.data]);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const addTrackToPlaylist = async (playlistId, track) => {
    if (!token) return alert('Please login to modify playlists');
    if (!track || !track.videoId) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/library/playlists/${playlistId}/tracks`, {
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail
      });
      // Update local state
      setPlaylists(playlists.map(p => p._id === playlistId ? res.data : p));
      alert(`Added to playlist!`);
    } catch (err) {
      console.error('Failed to add to playlist:', err);
    }
  };

  const removeTrackFromPlaylist = async (playlistId, videoId) => {
    if (!token) return alert('Please login to modify playlists');
    try {
      const res = await axios.delete(`http://localhost:5000/api/library/playlists/${playlistId}/tracks/${videoId}`);
      // Update local state
      setPlaylists(playlists.map(p => p._id === playlistId ? res.data : p));
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
