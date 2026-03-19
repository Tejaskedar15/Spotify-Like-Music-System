import { useContext } from 'react';
import { LibraryContext } from '../context/LibraryContext';
import { MusicContext } from '../context/MusicContext';
import { Play, Heart, Music, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Library = () => {
  const { favorites, toggleFavorite, isFavorite, playlists, addTrackToPlaylist } = useContext(LibraryContext);
  const { playTrack, playFromPlaylist, currentTrack } = useContext(MusicContext);

  return (
    <div className="p-8 pb-32 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-end gap-6 border-b border-white/10 pb-8"
      >
        <div className="w-48 h-48 rounded-2xl shadow-[0_0_40px_rgba(236,72,153,0.3)] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
          <Heart size={80} className="text-white fill-current drop-shadow-lg z-10 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-widest text-pink-300 drop-shadow-md">Playlist</span>
          <h1 className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-lg">Liked Songs</h1>
          <p className="text-white/80 font-medium text-lg mt-2 flex items-center gap-2">
             <Music size={18} />
             {favorites.length} songs saved to your library
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {favorites.length > 0 ? (
          <div className="flex flex-col gap-3">
            {favorites.map((track, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={track.videoId} 
                className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer backdrop-blur-md shadow-lg"
                onClick={() => playFromPlaylist(favorites, i)}
              >
                <div className="flex items-center gap-5">
                  <div className="text-white/40 font-mono w-6 text-center text-sm font-bold">{i + 1}</div>
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
                
                <div className="flex items-center gap-8 pr-4">
                  <div className="relative text-[#b3b3b3] hover:text-white transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()} title="Add to Playlist">
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
                    className="text-pink-500 hover:scale-125 transition-transform"
                  >
                    <Heart size={22} className={isFavorite(track.videoId) ? 'fill-current' : ''} />
                  </button>
                  <div className="text-sm text-white/40 font-mono w-12 text-right">
                    {track.duration || "Full"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 opacity-70"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <Heart size={40} className="text-white/30" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Songs you like will appear here</h2>
            <p className="text-white/60 font-medium text-lg">Save songs by tapping the heart icon in the player.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Library;
