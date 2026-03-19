import { createContext, useState, useRef, useEffect, useContext } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';

export const MusicContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const playerRef = useRef(null);

  // Poll for progress using the Youtube Player API
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(async () => {
        if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;
        try {
          const current = await playerRef.current.getCurrentTime();
          const total = await playerRef.current.getDuration();
          if (total > 0) {
            setCurrentTime(current);
            setDuration(total);
            setProgress((current / total) * 100);
          }
        } catch(e) {}
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const onReady = (event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume * 100);
  };

  const onStateChange = (event) => {
    // 1 is playing, 2 is paused, 0 is ended
    if (event.data === 1) setIsPlaying(true);
    else if (event.data === 2) setIsPlaying(false);
    else if (event.data === 0) {
      setIsPlaying(false);
      // Auto-play next track when song ends
      if (repeat) {
        // Repeat current track
        if (playerRef.current) {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
        }
      } else {
        playNext();
      }
    }
  };

  // Play a single track (standalone, not from a queue/playlist)
  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // Don't change queue if this track is already part of the current queue
    const existingIndex = queue.findIndex(t => t.videoId === track.videoId);
    if (existingIndex !== -1) {
      setQueueIndex(existingIndex);
    } else {
      // Playing a standalone track — fetch similar songs for auto-play
      fetchSimilarSongs(track);
    }
  };

  // Play a track from a playlist (sets the entire playlist as the queue)
  const playFromPlaylist = (tracks, startIndex = 0) => {
    if (!tracks || tracks.length === 0) return;
    setQueue(tracks);
    setQueueIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    setIsPlaying(true);
  };

  // Fetch similar songs to build a queue for auto-play
  const fetchSimilarSongs = async (track) => {
    try {
      const searchQuery = `${track.artist} ${track.title}`.slice(0, 50);
      const res = await axios.get(`${API_BASE_URL}/api/music/search?query=${searchQuery}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Put current track first, then similar songs (excluding the current one)
        const similar = res.data.filter(t => t.videoId !== track.videoId);
        const newQueue = [track, ...similar];
        setQueue(newQueue);
        setQueueIndex(0);
      } else {
        setQueue([track]);
        setQueueIndex(0);
      }
    } catch (err) {
      // If fetch fails, just set the single track as the queue
      setQueue([track]);
      setQueueIndex(0);
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    
    let nextIndex;
    if (shuffle) {
      // Pick a random track that's not the current one
      const available = queue.filter((_, i) => i !== queueIndex);
      if (available.length === 0) return;
      const randomTrack = available[Math.floor(Math.random() * available.length)];
      nextIndex = queue.indexOf(randomTrack);
    } else {
      nextIndex = queueIndex + 1;
    }

    if (nextIndex >= queue.length) {
      // Reached end of queue
      if (repeat) {
        nextIndex = 0; // Loop back to beginning
      } else {
        return; // Stop playing
      }
    }

    setQueueIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (queue.length === 0) return;
    
    // If more than 3 seconds into the song, restart it
    if (currentTime > 3 && playerRef.current) {
      playerRef.current.seekTo(0, true);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      if (repeat) {
        prevIndex = queue.length - 1; // Loop to end
      } else {
        prevIndex = 0; // Stay at the first track
      }
    }

    setQueueIndex(prevIndex);
    setCurrentTrack(queue[prevIndex]);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleShuffle = () => setShuffle(prev => !prev);
  const toggleRepeat = () => setRepeat(prev => !prev);

  const seek = async (percent) => {
    if (playerRef.current) {
      const duration = await playerRef.current.getDuration();
      const time = (percent / 100) * duration;
      playerRef.current.seekTo(time, true);
      setProgress(percent);
    }
  };

  const updateVolume = (val) => {
    setVolume(val);
    if (playerRef.current) {
      playerRef.current.setVolume(val * 100);
    }
  };

  return (
    <MusicContext.Provider value={{
      currentTrack, isPlaying, progress, currentTime, duration, volume, queue, queueIndex,
      shuffle, repeat,
      playTrack, playFromPlaylist, togglePlay, seek, updateVolume,
      playNext, playPrevious, toggleShuffle, toggleRepeat
    }}>
      {children}
      {currentTrack && (
        <div className="absolute opacity-0 pointer-events-none -z-50 -top-[9999px]">
          <YouTube 
            videoId={currentTrack.videoId}
            opts={{
              height: '1',
              width: '1',
              playerVars: {
                autoplay: 1,
                controls: 0,
                origin: window.location.origin
              },
            }}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        </div>
      )}
    </MusicContext.Provider>
  );
};
