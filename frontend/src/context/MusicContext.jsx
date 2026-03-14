import { createContext, useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
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
      // Logic to play next track goes here later
    }
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    // Setting state to true here is optimistic; the true state comes from onStateChange
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
      currentTrack, isPlaying, progress, currentTime, duration, volume, queue,
      playTrack, togglePlay, seek, updateVolume
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
                // These help bypass some frame blocking mechanisms
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
