'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoicePlayerProps {
  url: string;
  duration?: number;
}

export default function VoicePlayer({ url, duration = 0 }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100/50 p-3 rounded-2xl border border-purple-100/50 shadow-sm transition-all hover:shadow-md group">
      <audio ref={audioRef} src={url} />
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-white text-purple-600 hover:bg-purple-100 hover:scale-105 transition-transform shrink-0 shadow-sm"
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-purple-600" /> : <Play className="w-5 h-5 fill-purple-600 ml-1" />}
      </Button>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold text-purple-400 geist-mono uppercase tracking-widest">
           <span>{isPlaying ? 'Playing Voice' : 'Voice Message'}</span>
           <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        
        <div className="relative h-1.5 bg-purple-200/50 rounded-full overflow-hidden cursor-pointer">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleMute}
        className="w-8 h-8 rounded-full text-purple-400 hover:text-purple-600 hover:bg-purple-50 shrink-0"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>
    </div>
  );
}
