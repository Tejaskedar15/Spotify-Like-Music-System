import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Playlist from './pages/Playlist';

function App() {
  return (
    <Router>
      <div className="flex h-screen text-white overflow-hidden pointer-events-auto mesh-bg">
        <Sidebar className="w-64 flex-shrink-0" />
        <main className="flex-1 overflow-y-auto pb-24 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/playlist/:id" element={<Playlist />} />
          </Routes>
        </main>
        <Player />
      </div>
    </Router>
  );
}

export default App;
