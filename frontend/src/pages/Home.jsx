import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MusicContext } from '../context/MusicContext';
import { Play, Heart, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { LibraryContext } from '../context/LibraryContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
  const [mixes, setMixes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingMixes, setLoadingMixes] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const { playTrack } = useContext(MusicContext);
  const { token } = useContext(AuthContext);
  const { isFavorite, toggleFavorite, playlists, addTrackToPlaylist } = useContext(LibraryContext);

  useEffect(() => {
    const fetchMixes = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/music/mixes`);
        setMixes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMixes(false);
      }
    };
    fetchMixes();
  }, []);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!token) {
        setLoadingRecs(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/music/recommendations`);
        setRecommendations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [token]);

  // IST time-based greeting
  const getGreeting = () => {
    // Get IST time (UTC + 5:30)
    const now = new Date();
    const istOffset = 5.5 * 60; // IST offset in minutes
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const istMinutes = utcMinutes + istOffset;
    const istHour = Math.floor((istMinutes / 60) % 24);
    
    if (istHour >= 5 && istHour < 12) return 'Good morning';
    if (istHour >= 12 && istHour < 17) return 'Good afternoon';
    if (istHour >= 17 && istHour < 21) return 'Good evening';
    return 'Good night';
  };

  return (
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6">{getGreeting()}</h1>

      {/* Mixes Section */}
      <h2 className="text-2xl font-bold mb-4">Your Top Mixes</h2>
      {loadingMixes ? (
        <div className="flex gap-4 mb-10 overflow-hidden"><div className="w-8 h-8 border-4 border-[#1ed760] border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {mixes.map((mix, i) => (
            <div
              key={i}
              onClick={() => playTrack(mix)}
              className="flex items-center bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all duration-300 rounded-xl overflow-hidden cursor-pointer group shadow-xl"
            >
              <div className="w-24 h-24 bg-gray-800 flex-shrink-0 relative overflow-hidden">
                <img src={mix.thumbnail} alt={mix.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-4 font-bold text-lg text-white drop-shadow-md line-clamp-2 leading-tight">{mix.title}</div>
              <div className="ml-auto mr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                <button className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-white shadow-[0_0_20px_rgba(236,72,153,0.6)]">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Section */}
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      {loadingRecs ? (
        <div className="flex gap-4"><div className="w-8 h-8 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recommendations.map((track, i) => (
            <div
              key={i}
              onClick={() => playTrack(track)}
              className="bg-[#181818] hover:bg-[#282828] p-4 rounded-xl transition-colors duration-300 cursor-pointer group"
            >
              <div className="relative mb-4 pb-[100%] rounded-md overflow-hidden shadow-lg">
                <img src={track.thumbnail} alt={track.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute right-2 bottom-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <button className="w-12 h-12 bg-[#1db954] rounded-full flex items-center justify-center hover:scale-105 hover:bg-[#1ed760] shadow-xl text-black">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </button>
                </div>
              </div>
              <div className="flex items-start justify-between mt-2">
                <div className="overflow-hidden pr-2">
                  <h3 className="font-bold text-white mb-1 truncate">{track.title}</h3>
                  <p className="text-sm text-[#b3b3b3] truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative text-[#b3b3b3] hover:text-white transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer" onClick={(e) => e.stopPropagation()} title="Add to Playlist">
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
                    className="text-[#b3b3b3] hover:text-white transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Heart size={18} className={isFavorite(track.videoId) ? 'fill-[#1db954] text-[#1db954]' : ''} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!recommendations || recommendations.length === 0) && (
            <p className="text-[#b3b3b3] col-span-full">Play some songs to get recommendations based on your listening history!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
