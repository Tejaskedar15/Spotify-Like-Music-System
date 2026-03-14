import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { LibraryContext } from '../context/LibraryContext';

const Sidebar = ({ className }) => {
  const { playlists, createPlaylist } = useContext(LibraryContext);

  const handleCreatePlaylist = async () => {
    const name = window.prompt("Enter new playlist name:");
    if (name && name.trim()) {
      await createPlaylist(name.trim());
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={24} /> },
    { name: 'Search', path: '/search', icon: <Search size={24} /> },
    { name: 'Your Library', path: '/library', icon: <Library size={24} /> },
  ];

  return (
    <div className={`bg-black/30 backdrop-blur-2xl border-r border-white/10 h-full flex flex-col pt-6 px-4 ${className} select-none`}>
      <div className="mb-8 px-2 flex-shrink-0">
        <div className="flex justify-center items-center h-32 overflow-hidden mb-4">
          <img src="/logo.png" alt="VibeStream Logo" className="w-full h-full object-contain scale-[1.8] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
        </div>
      </div>

      <nav className="flex flex-col gap-2 mb-8">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                isActive ? 'bg-gradient-to-r from-pink-500/80 to-purple-500/80 text-white shadow-lg backdrop-blur-md' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2 mb-4">
        <button onClick={handleCreatePlaylist} className="flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 text-white/60 hover:text-white hover:bg-white/10 font-semibold text-sm group">
          <div className="opacity-70 group-hover:opacity-100 transition-opacity">
             <PlusSquare size={24} />
          </div>
          <span>Create Playlist</span>
        </button>
        <NavLink to="/library" className={({ isActive }) => `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 font-semibold text-sm group ${isActive ? 'bg-white/10 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
          <div className="opacity-80 group-hover:opacity-100 transition-opacity">
            <Heart size={24} className="text-white fill-pink-500 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[4px] rounded-md shadow-md" />
          </div>
          <span>Liked Songs</span>
        </NavLink>
      </div>
      
      <hr className="border-white/10 mb-6" />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ul className="flex flex-col gap-1 text-sm text-[#b3b3b3]">
          {(playlists || []).map((playlist) => (
            <motion.li 
              key={playlist._id} 
              whileHover={{ x: 3 }}
            >
              <NavLink
                to={`/playlist/${playlist._id}`}
                className={({ isActive }) => 
                  `block px-2 py-1.5 rounded-md transition-all duration-300 truncate ${
                    isActive ? 'text-white bg-white/10 font-bold' : 'hover:text-white'
                  }`
                }
              >
                {playlist.name}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
