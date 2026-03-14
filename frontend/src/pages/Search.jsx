import { Search as SearchIcon, Play, Heart, Plus } from 'lucide-react';
import { useState, useContext } from 'react';
import axios from 'axios';
import { MusicContext } from '../context/MusicContext';
import { LibraryContext } from '../context/LibraryContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useContext(MusicContext);
  const { isFavorite, toggleFavorite, playlists, addTrackToPlaylist } = useContext(LibraryContext);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    setQuery(searchTerm);
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/music/search?query=${searchTerm}`);
      if (Array.isArray(res.data)) {
        setResults(res.data);
      } else {
        console.error("Invalid API response format", res.data);
        setResults([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      performSearch(query);
    }
  };

  return (
    <div className="p-8 pb-32 min-h-screen">
      <div className="mb-10">
        <div className="relative max-w-lg rounded-full bg-white/10 backdrop-blur-xl border border-white/20 group focus-within:bg-white/20 focus-within:border-white/40 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={20} />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-transparent outline-none border-none py-3 pl-12 pr-4 text-white group-focus-within:text-black placeholder-[#b3b3b3] group-focus-within:placeholder-gray-500 font-medium rounded-full"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center mt-12">
            <div className="w-8 h-8 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Top results</h2>
            <div className="flex flex-col gap-2">
              {results.map((track, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={track.videoId}
                  className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer backdrop-blur-md shadow-lg"
                  onClick={() => playTrack(track)}
                >
                  <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 rounded-lg bg-[#282828] overflow-hidden flex-shrink-0 shadow-md">
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="text-white fill-current drop-shadow-lg scale-75 group-hover:scale-100 transition-transform" size={24} />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className={`font-bold text-lg line-clamp-1 transition-colors ${currentTrack?.videoId === track.videoId ? 'text-pink-400' : 'text-white'}`}>{track.title}</h4>
                      <p className="text-sm text-white/60 line-clamp-1 font-medium">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pr-2">
                    <div className="relative text-[#b3b3b3] hover:text-white transition-colors opacity-0 group-hover:opacity-100 cursor-pointer" onClick={(e) => e.stopPropagation()} title="Add to Playlist">
                      <select
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            addTrackToPlaylist(e.target.value, track);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="" disabled>Add to Playlist</option>
                        {playlists.map(p => <option key={p._id} value={p._id} className="bg-[#282828] text-white p-2">{p.name}</option>)}
                      </select>
                      <Plus size={18} />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
                      className="text-[#b3b3b3] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Heart size={18} className={isFavorite(track.videoId) ? 'fill-[#1db954] text-[#1db954]' : ''} />
                    </button>
                    <div className="text-sm text-white/40 opacity-0 group-hover:opacity-100 transition-opacity font-mono w-10 text-right">
                      {track.duration}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {['Pop', 'Hip-Hop', 'Rock', 'Latin', 'Podcast', 'Jazz', 'Classical', 'R&B', 'K-Pop', 'Chill'].map((cat, i) => (
                <motion.div
                  onClick={() => performSearch(cat)}
                  whileHover={{ scale: 1.05 }}
                  key={i}
                  className={`aspect-square rounded-lg p-4 font-bold text-xl relative overflow-hidden cursor-pointer hover:shadow-xl shadow-lg transition duration-300`}
                  style={{ backgroundColor: `hsl(${i * 36}, 70%, 40%)` }}>
                  <span className="relative z-10">{cat}</span>
                  <div className="w-24 h-24 bg-black/20 absolute -right-4 -bottom-4 rotate-[25deg] shadow-lg"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
