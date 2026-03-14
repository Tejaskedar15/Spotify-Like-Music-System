import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';
import { LibraryContext } from '../context/LibraryContext';

const Player = () => {
  const { currentTrack, isPlaying, progress, currentTime, duration, volume, togglePlay, seek, updateVolume } = useContext(MusicContext);
  const { isFavorite, toggleFavorite, playlists, addTrackToPlaylist } = useContext(LibraryContext);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/40 backdrop-blur-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] px-4 flex items-center justify-between z-50 transition-all duration-300 pointer-events-auto">
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-1/3 min-w-[180px]">
        <div className="group relative w-14 h-14 rounded-md overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          <img 
            src={currentTrack.thumbnail} 
            alt="Album art" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex flex-col">
          <a href="#" className="text-white text-sm font-semibold hover:underline line-clamp-1">{currentTrack.title}</a>
          <a href="#" className="text-[#b3b3b3] text-xs hover:underline hover:text-white line-clamp-1">{currentTrack.artist}</a>
        </div>
        <button 
           onClick={() => toggleFavorite(currentTrack)} 
           className={`${isFavorite(currentTrack.videoId) ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'} ml-2 transition-colors relative z-10 cursor-pointer`}
        >
          <Heart size={16} className={isFavorite(currentTrack.videoId) ? 'fill-current' : ''} />
        </button>
        <div className="relative text-[#b3b3b3] hover:text-white transition-colors cursor-pointer ml-2 z-10 opacity-70 hover:opacity-100" title="Add to Playlist">
          <select 
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            defaultValue=""
            onChange={(e) => {
               if (e.target.value) {
                  addTrackToPlaylist(e.target.value, currentTrack);
                  e.target.value = "";
               }
            }}
          >
            <option value="" disabled>Add to Playlist</option>
            {playlists.map(p => <option key={p._id} value={p._id} className="bg-[#282828] text-white p-2">{p.name}</option>)}
          </select>
          <Plus size={18} />
        </div>
      </div>

      {/* Primary Controls */}
      <div className="flex flex-col items-center max-w-[45%] w-full gap-2">
        <div className="flex items-center gap-6">
          <button className="text-[#b3b3b3] hover:text-white transition-colors">
            <Shuffle size={20} />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition-colors">
            <SkipBack size={24} className="fill-current" />
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-1" />}
          </motion.button>
          
          <button className="text-[#b3b3b3] hover:text-white transition-colors">
            <SkipForward size={24} className="fill-current" />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition-colors">
            <Repeat size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full max-w-md text-xs text-[#b3b3b3] font-medium">
          <span>{formatTime(currentTime)}</span>
          <div 
            className="h-1 flex-1 bg-[#4d4d4d] rounded-full overflow-hidden group cursor-pointer flex items-center"
            onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               seek(((e.clientX - rect.left) / rect.width) * 100);
            }}
          >
            <div 
              className="h-full bg-white group-hover:bg-[#1db954] rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md"></div>
            </div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-end gap-3 w-1/3 min-w-[180px] text-[#b3b3b3]">
        <div className="flex items-center gap-2 group w-24">
          <button onClick={() => updateVolume(volume === 0 ? 1 : 0)} className="hover:text-white transition-colors">
             <Volume2 size={18} />
          </button>
          <div 
             className="h-1 flex-1 bg-[#4d4d4d] rounded-full overflow-hidden cursor-pointer flex items-center"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               updateVolume((e.clientX - rect.left) / rect.width);
             }}
          >
             <div className="h-full bg-white group-hover:bg-[#1db954] rounded-full" style={{ width: `${volume * 100}%` }}></div>
          </div>
        </div>
        <button className="hover:text-white transition-colors ml-2"><Maximize2 size={16} /></button>
      </div>

    </div>
  );
};

export default Player;
