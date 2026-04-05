import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Repeat2, Rocket, Smile, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import VoicePlayer from './VoicePlayer';

export function PostCard({ post, onSteal, onReply, onBoost }: any) {
  const { user, setAuthModalOpen } = useStore();
  const [localReactions, setLocalReactions] = useState(post.reactions || []);
  const [showEmojis, setShowEmojis] = useState(false);

  const handleReact = async (emoji: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Optimistic UI
    const existing = localReactions.find((r: any) => r.emoji === emoji);
    if (existing) {
      setLocalReactions(localReactions.map((r: any) => 
        r.emoji === emoji ? { ...r, count: r.count - 1 } : r
      ).filter((r: any) => r.count > 0));
    } else {
      setLocalReactions([...localReactions, { emoji, count: 1 }]);
    }

    setShowEmojis(false);

    try {
      await fetch(`/api/posts/react/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });
    } catch (err) {
      console.error("React failed:", err);
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 p-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <Link href={`/app/profile/${post.author.username}`} className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-gray-200">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">{post.author.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 hover:underline">{post.author.displayName}</span>
              <span className="text-gray-500 text-sm">@{post.author.username}</span>
              {post.author.xHandle && (
                <a 
                  href={`https://x.com/${post.author.xHandle.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 p-1 hover:bg-gray-100 rounded-full transition-colors group/x"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-gray-900 group-hover/x:fill-black" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </a>
              )}
              <span className="text-gray-400 text-sm">·</span>
              <span className="text-gray-400 text-sm">{formatDistanceToNow(new Date(post.createdAt))} ago</span>
            </div>
            {post.isBoosted && (
              <div className="flex items-center gap-1 -mt-1">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-1.5 py-0 border-none h-4">
                  <Rocket className="w-3 h-3 mr-1 inline" /> Boosted
                </Badge>
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="pl-13 text-gray-800 text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">
        {post.content}
      </div>

      {post.voiceUrl && (
        <div className="pl-13 mb-4">
          <VoicePlayer url={post.voiceUrl} duration={post.voiceDuration} />
        </div>
      )}

      <div className="pl-13 mb-4">
        <div className="flex flex-wrap gap-2 sm:gap-4 bg-purple-50 rounded-xl p-3 border border-purple-100 relative group/info">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Locked</span>
            <span className="geist-mono text-purple-900 font-bold">{(post.usdcAmountLocked || 0).toFixed(2)} USDC</span>
          </div>
          <div className="w-px bg-purple-200 h-8 self-center"></div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Steal Price</span>
            <span className="geist-mono text-purple-600 font-bold">{(post.stealPrice || 0).toFixed(2)} USDC</span>
          </div>
          <div className="w-px bg-purple-200 h-8 self-center"></div>
          <div className="flex flex-col">
             <span className="text-[10px] text-purple-600 font-bold uppercase tracking-tight">Post Revenue</span>
             <span className="geist-mono text-green-600 font-bold">+{(post.totalEarnings || 0).toFixed(2)} USDC</span>
          </div>
        </div>
      </div>

      <div className="pl-13 flex items-center justify-between text-gray-500 mt-2 relative">
        <button onClick={() => onReply(post.id)} className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-sm geist-mono font-medium">{post.replyCount || 0}</span>
        </button>

        <button onClick={() => onBoost(post.id)} className="flex items-center gap-2 group hover:text-purple-500 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-purple-50 transition-colors">
            <Rocket className="w-4 h-4" />
          </div>
          <span className="text-sm">Boost</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowEmojis(!showEmojis)} 
            className={`flex items-center gap-2 group transition-colors ${showEmojis ? 'text-purple-600' : 'hover:text-purple-500'}`}
          >
            <div className={`p-2 rounded-full transition-colors ${showEmojis ? 'bg-purple-100' : 'group-hover:bg-purple-50'}`}>
              <Smile className="w-4 h-4" />
            </div>
            <span className="text-sm">React</span>
          </button>

          {showEmojis && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1.5 bg-white rounded-full shadow-xl border border-purple-100 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2 z-20">
              {['🔥', '🚀', '💎', '❤️'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="p-1.5 hover:bg-purple-50 rounded-full transition-colors active:scale-90"
                >
                  <span className="text-lg">{emoji}</span>
                </button>
              ))}
            </div>
          )}
          
          {localReactions.length > 0 && (
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              {localReactions.slice(0, 2).map((r: any) => (
                <span key={r.emoji} className="text-[10px] grayscale-0">{r.emoji}</span>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => onSteal(post)} className="flex items-center gap-2 group hover:text-green-500 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
            <Repeat2 className="w-5 h-5" />
          </div>
          <span className="text-sm geist-mono font-medium">{post.stolenCount > 0 ? post.stolenCount : 'Steal'}</span>
        </button>
      </div>
    </div>
  );
}
