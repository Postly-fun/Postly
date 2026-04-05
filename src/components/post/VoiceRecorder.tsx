'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Trash2, Play, Pause, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onUploadComplete: (url: string, duration: number) => void;
  onDiscard: () => void;
}

export default function VoiceRecorder({ onUploadComplete, onDiscard }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        uploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const uploadAudio = async (blob: Blob) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onUploadComplete(data.url, duration);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error('Failed to upload voice message: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl!);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-purple-50/50 p-4 rounded-2xl border border-purple-100 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-red-500 geist-mono uppercase tracking-widest text-[10px]">Recording</span>
            </div>
          ) : (
            <span className="text-sm font-bold text-purple-700 geist-mono uppercase tracking-widest text-[10px]">
              {audioUrl ? 'Voice Preview' : 'Voice Message'}
            </span>
          )}
          <span className="text-lg font-bold text-purple-900 geist-mono">{formatTime(duration)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {!audioUrl && !isRecording && (
            <Button 
              onClick={startRecording}
              className="rounded-full w-10 h-10 p-0 bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200"
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}

          {isRecording && (
            <Button 
              onClick={stopRecording}
              className="rounded-full w-10 h-10 p-0 bg-red-500 hover:bg-red-600 shadow-md shadow-red-200"
            >
              <Square className="w-5 h-5 fill-white" />
            </Button>
          )}

          {audioUrl && (
            <>
              <Button 
                variant="ghost" 
                onClick={togglePlayback}
                className="rounded-full w-10 h-10 p-0 text-purple-600 hover:bg-purple-100"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-purple-600" /> : <Play className="w-5 h-5 fill-purple-600" />}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  if (audioUrl) URL.revokeObjectURL(audioUrl);
                  setAudioUrl(null);
                  setDuration(0);
                  onDiscard();
                }}
                className="rounded-full w-10 h-10 p-0 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-purple-500 font-medium">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Uploading voice message...</span>
        </div>
      )}

      {isRecording && (
        <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 animate-[progress_60s_linear]" />
        </div>
      )}
    </div>
  );
}
