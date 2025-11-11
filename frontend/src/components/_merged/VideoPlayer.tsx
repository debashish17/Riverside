import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward,
  Download
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onDownload?: () => void;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, onDownload, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative ${className}`}>
      {/* Outer Glow Container */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-30"></div>
        
        {/* Video Container */}
        <div 
          className="relative bg-black rounded-2xl overflow-hidden border border-zinc-800/50"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-contain"
            onClick={togglePlay}
          />
          
          {/* Controls Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            
            {/* Title Header */}
            {title && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium text-lg truncate">{title}</h3>
                  <div className="flex items-center gap-2">
                    {onDownload && (
                      <button
                        onClick={onDownload}
                        className="p-2 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all"
                        title="Download"
                      >
                        <Download className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all"
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={togglePlay}
                className="pointer-events-auto group relative w-20 h-20"
                title="Play/Pause"
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/20 group-hover:bg-white/20 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-white" strokeWidth={1.5} />
                  ) : (
                    <Play className="w-10 h-10 text-white ml-1" strokeWidth={1.5} />
                  )}
                </div>
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* Progress Bar Container */}
              <div className="mb-5">
                <div className="relative group/progress">
                  {/* Background Track */}
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    {/* Progress Fill */}
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 relative"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      {/* Glow Effect */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-blue-500/50"></div>
                    </div>
                  </div>
                  {/* Invisible Full-Width Input */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Control Buttons Bar */}
              <div className="relative">
                <div className="absolute -inset-2 bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-zinc-800/50"></div>
                <div className="relative flex items-center justify-between px-4 py-3">
                  
                  {/* Left Controls */}
                  <div className="flex items-center gap-4">
                    {/* Skip Back */}
                    <button
                      onClick={() => skipTime(-10)}
                      className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
                      title="Skip Back 10s"
                    >
                      <SkipBack className="w-5 h-5" strokeWidth={1.5} />
                    </button>

                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="p-2.5 bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-lg transition-all"
                      title="Play/Pause"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" strokeWidth={1.5} />
                      ) : (
                        <Play className="w-5 h-5" strokeWidth={1.5} />
                      )}
                    </button>

                    {/* Skip Forward */}
                    <button
                      onClick={() => skipTime(10)}
                      className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
                      title="Skip Forward 10s"
                    >
                      <SkipForward className="w-5 h-5" strokeWidth={1.5} />
                    </button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3 ml-2">
                      <button
                        onClick={toggleMute}
                        className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
                        title="Mute/Unmute"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5" strokeWidth={1.5} />
                        ) : (
                          <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                        )}
                      </button>
                      
                      {/* Volume Slider */}
                      <div className="relative w-24 h-1.5 bg-white/20 rounded-full overflow-hidden group/volume">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                          style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full"></div>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Time Display */}
                    <div className="text-white text-sm font-mono ml-2 tabular-nums">
                      <span className="text-zinc-300">{formatTime(currentTime)}</span>
                      <span className="text-zinc-600 mx-1">/</span>
                      <span className="text-zinc-500">{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Right Controls (Mobile - Hidden in Top Bar) */}
                  <div className="flex items-center gap-2 md:hidden">
                    {onDownload && (
                      <button
                        onClick={onDownload}
                        className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
                        title="Download"
                      >
                        <Download className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    )}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
                      title="Fullscreen"
                    >
                      <Maximize className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;