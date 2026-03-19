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
  const playedIds = useRef(new Set()); // Track played song IDs to avoid repeats

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
      // Playing a standalone track — fetch different songs for auto-play
      playedIds.current.clear();
      playedIds.current.add(track.videoId);
      fetchDifferentSongs(track);
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

  // Search queries to find truly different but related songs
  const getRelatedSearchQueries = (track) => {
    const title = track.title || '';
    const artist = track.artist || '';
    
    // Extract potential genre keywords from the title
    const genreKeywords = ['pop', 'rock', 'hip hop', 'rap', 'jazz', 'classical', 'lofi', 'chill', 
      'edm', 'dance', 'r&b', 'soul', 'country', 'indie', 'acoustic', 'bollywood', 'hindi',
      'punjabi', 'tamil', 'telugu', 'romantic', 'sad', 'party', 'workout', 'motivation',
      'kpop', 'latin', 'reggaeton', 'metal', 'blues', 'folk'];
    
    const lowerTitle = title.toLowerCase();
    const lowerArtist = artist.toLowerCase();
    const matchedGenre = genreKeywords.find(g => lowerTitle.includes(g) || lowerArtist.includes(g));
    
    // Build diverse search queries to get truly different songs
    const queries = [];
    if (matchedGenre) {
      queries.push(`${matchedGenre} songs 2024`);
      queries.push(`best ${matchedGenre} music`);
      queries.push(`${matchedGenre} hits playlist`);
    }
    // Search by mood/vibe rather than exact song
    queries.push(`songs like ${title.split(' ').slice(0, 3).join(' ')}`);
    queries.push(`${artist} type songs`);
    queries.push(`${title.split(' ')[0]} music mix`);
    
    return queries;
  };

  // Fetch truly different songs for auto-play  
  const fetchDifferentSongs = async (track) => {
    try {
      const queries = getRelatedSearchQueries(track);
      // Pick a random query to get variety
      const searchQuery = queries[Math.floor(Math.random() * queries.length)];
      const res = await axios.get(`${API_BASE_URL}/api/music/search?query=${searchQuery}`);
      
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Filter out already played songs and the current song
        const fresh = res.data.filter(t => 
          t.videoId !== track.videoId && !playedIds.current.has(t.videoId)
        );
        const newQueue = [track, ...(fresh.length > 0 ? fresh : res.data.filter(t => t.videoId !== track.videoId))];
        setQueue(newQueue);
        setQueueIndex(0);
      } else {
        setQueue([track]);
        setQueueIndex(0);
      }
    } catch (err) {
      setQueue([track]);
      setQueueIndex(0);
    }
  };

  // When queue runs out, fetch more different songs based on the last played track
  const fetchMoreSongs = async (lastTrack) => {
    try {
      const queries = getRelatedSearchQueries(lastTrack);
      const searchQuery = queries[Math.floor(Math.random() * queries.length)];
      const res = await axios.get(`${API_BASE_URL}/api/music/search?query=${searchQuery}`);
      
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Filter out already played IDs AND songs with similar titles (to avoid covers/duplicates)
        const currentTitle = lastTrack.title.toLowerCase().split('(')[0].trim();
        const fresh = res.data.filter(t => {
          const isPlayed = playedIds.current.has(t.videoId);
          const sameTitle = t.title.toLowerCase().includes(currentTitle);
          return !isPlayed && !sameTitle;
        });

        if (fresh.length > 0) {
          setQueue(prev => [...prev, ...fresh]);
          // Play the first new song
          const nextIdx = queue.length; // index of first newly added song
          setQueueIndex(nextIdx);
          setCurrentTrack(fresh[0]);
          playedIds.current.add(fresh[0].videoId);
          setIsPlaying(true);
          return true;
        }
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const playNext = async () => {
    if (queue.length === 0) return;
    
    let nextIndex;
    if (shuffle) {
      // Pick a random track that's not the current one
      const available = queue.filter((_, i) => i !== queueIndex && !playedIds.current.has(queue[i]?.videoId));
      if (available.length === 0) {
        // All songs played, fetch more
        if (currentTrack) await fetchMoreSongs(currentTrack);
        return;
      }
      const randomTrack = available[Math.floor(Math.random() * available.length)];
      nextIndex = queue.indexOf(randomTrack);
    } else {
      nextIndex = queueIndex + 1;
    }

    if (nextIndex >= queue.length) {
      // Reached end of queue — fetch more different songs instead of stopping
      if (repeat) {
        nextIndex = 0;
      } else if (currentTrack) {
        // Auto-fetch new songs
        await fetchMoreSongs(currentTrack);
        return;
      } else {
        return;
      }
    }

    setQueueIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    playedIds.current.add(queue[nextIndex]?.videoId);
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
