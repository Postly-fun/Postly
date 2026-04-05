'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Mic, X, ImageIcon, Link as LinkIcon, Upload, Loader2 } from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

export default function CreatePostModal() {
  const { user, setUser, isCreatePostModalOpen, setCreatePostModalOpen } = useStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('0.1');
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
        setShowImageInput(true);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error('Failed to upload image: ' + err.message);
    } finally {
      setIsImageUploading(false);
    }
  };

  const cost = parseFloat(usdcAmount) || 0;
  const stealPrice = cost * 2;
  const canPost = (content.trim().length > 0 || voiceUrl || imageUrl) && cost >= 0.1 && (user?.usdcBalance || 0) >= cost;

  const postMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          usdcAmount: cost,
          voiceUrl,
          voiceDuration,
          imageUrl: imageUrl.trim() || undefined,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      setContent('');
      setVoiceUrl(null);
      setVoiceDuration(null);
      setImageUrl('');
      setShowRecorder(false);
      setShowImageInput(false);
      toast.success('Post published! Your USDC is locked in.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (user) setUser({ ...user, usdcBalance: user.usdcBalance - cost });
      setCreatePostModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message)
  });

  if (!user) return null;

  return (
    <Dialog open={isCreatePostModalOpen} onOpenChange={setCreatePostModalOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
          <DialogTitle className="text-2xl font-bold font-sans">Create New Post</DialogTitle>
          <DialogDescription className="text-purple-100">
            Share your thoughts and lock in some USDC to start earning.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 bg-white">
          <div className="flex gap-4">
            <Avatar className="w-12 h-12 border-2 border-purple-100 shadow-sm grow-0 shrink-0">
              <AvatarImage src={user?.avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-lg">{user?.displayName?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea 
                placeholder="What's worth paying for?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-none focus-visible:ring-0 text-xl resize-none min-h-[120px] p-0 placeholder:text-gray-400 mb-2"
                maxLength={280}
                autoFocus
              />

              <div className="mb-4 flex flex-wrap gap-2">
                {!showRecorder && !showImageInput && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRecorder(true)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full px-4 h-9 font-bold"
                    >
                      <Mic className="w-4 h-4" />
                      {voiceUrl ? 'Voice Message Added' : 'Add Voice'}
                      {voiceUrl && <X className="w-3 h-3 ml-1 text-purple-400" onClick={(e) => {
                        e.stopPropagation();
                        setVoiceUrl(null);
                        setVoiceDuration(null);
                      }} />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowImageInput(true)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full px-4 h-9 font-bold"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {imageUrl ? 'Image/GIF Added' : 'Add GIF/Image'}
                      {imageUrl && <X className="w-3 h-3 ml-1 text-blue-400" onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl('');
                      }} />}
                    </Button>
                  </>
                )}

                {showRecorder && (
                  <div className="w-full">
                    <VoiceRecorder 
                      onUploadComplete={(url, dur) => {
                        setVoiceUrl(url);
                        setVoiceDuration(dur);
                      }} 
                      onDiscard={() => {
                        setVoiceUrl(null);
                        setVoiceDuration(null);
                        setShowRecorder(false);
                      }}
                    />
                  </div>
                )}

                {showImageInput && (
                  <div className="w-full flex items-center gap-2 bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                    <input 
                      type="file" 
                      accept="image/*,video/webm" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImageUploading}
                      className="bg-white rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 h-9 px-3 shrink-0 shadow-sm gap-2"
                    >
                      {isImageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span className="hidden sm:inline">Upload</span>
                    </Button>
                    <span className="text-blue-300 text-sm">or</span>
                    <LinkIcon className="w-4 h-4 text-blue-400 shrink-0" />
                    <Input 
                      placeholder="Paste Image/GIF Link..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="border-none bg-transparent focus-visible:ring-0 shadow-none text-sm placeholder:text-blue-400 px-1"
                      autoFocus
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowImageInput(false)}
                      className="rounded-full w-8 h-8 p-0 text-blue-500 hover:bg-blue-100 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                 <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex flex-col gap-1">
                       <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Post Cost</span>
                       <span className="text-xs text-gray-500">Min 0.1 USDC</span>
                    </div>
                    <div className="relative w-36">
                       <Input 
                          type="number" 
                          min="0.1" 
                          step="0.1" 
                          value={usdcAmount}
                          onChange={(e) => setUsdcAmount(e.target.value)}
                          className="pl-3 pr-14 h-12 text-lg font-bold text-purple-700 bg-white border-purple-200 focus-visible:ring-purple-500 rounded-lg geist-mono shadow-sm"
                       />
                       <span className="absolute right-4 top-3 text-sm text-purple-400 geist-mono font-bold pointer-events-none">USDC</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100/50">
                       <span className="block text-gray-500 text-xs mb-1">Steal Price</span>
                       <span className="font-bold text-purple-700 geist-mono text-base">{stealPrice.toFixed(2)} USDC</span>
                    </div>
                    <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100/50">
                       <span className="block text-gray-500 text-xs mb-1">Your Balance</span>
                       <span className={`font-bold geist-mono text-base ${ (user?.usdcBalance || 0) < cost ? 'text-red-500' : 'text-gray-700'}`}>
                          {(user?.usdcBalance || 0).toFixed(2)} USDC
                       </span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <Button variant="ghost" onClick={() => setCreatePostModalOpen(false)} className="rounded-full px-6 font-medium text-gray-500 hover:text-gray-700">
            Cancel
          </Button>
          <Button 
            onClick={() => postMutation.mutate()} 
            disabled={!canPost || postMutation.isPending}
            className="rounded-full px-8 bg-purple-600 hover:bg-purple-700 font-bold h-11 shadow-lg shadow-purple-200 transition-all active:scale-95"
          >
            {postMutation.isPending ? 'Posting...' : 'Create Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
