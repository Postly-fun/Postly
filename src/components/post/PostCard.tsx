import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Repeat2, Rocket, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function PostCard({ post, onSteal, onReply, onBoost }: any) {
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
        <button className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-200 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="pl-13 text-gray-800 text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">
        {post.content}
      </div>

      <div className="pl-13 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-purple-50 rounded-xl p-3 border border-purple-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Locked</span>
            <span className="geist-mono text-purple-900 font-bold">{post.usdcAmountLocked.toFixed(2)} USDC</span>
          </div>
          <div className="hidden sm:block w-px bg-purple-200"></div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Steal Price</span>
            <span className="geist-mono text-purple-600 font-bold">{post.stealPrice.toFixed(2)} USDC</span>
          </div>
          <div className="hidden sm:block w-px bg-purple-200"></div>
          <div className="flex flex-col truncate">
            <span className="text-xs text-gray-500 font-medium">Current Owner</span>
            <span className="text-purple-700 font-medium truncate shrink-0 flex items-center gap-1">
               {post.stolenCount > 0 && <Repeat2 className="w-3 h-3" />}
               @{post.currentOwner.username}
            </span>
          </div>
        </div>
      </div>

      <div className="pl-13 flex items-center justify-between text-gray-500">
        <button onClick={() => onReply(post.id)} className="flex items-center gap-2 group hover:text-blue-500 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-sm geist-mono font-medium">{post.replyCount || 0}</span>
        </button>

        <button onClick={() => onSteal(post)} className="flex items-center gap-2 group hover:text-green-500 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
            <Repeat2 className="w-5 h-5" />
          </div>
          <span className="text-sm geist-mono font-medium">{post.stolenCount > 0 ? post.stolenCount : 'Steal'}</span>
        </button>

        <button onClick={() => onBoost(post.id)} className="flex items-center gap-2 group hover:text-purple-500 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-purple-50 transition-colors">
            <Rocket className="w-4 h-4" />
          </div>
          <span className="text-sm">Boost</span>
        </button>

        <button className="flex items-center gap-2 group hover:text-gray-900 transition-colors">
          <div className="p-2 rounded-full group-hover:bg-gray-200 transition-colors">
            <Share className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
}
