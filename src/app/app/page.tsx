'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function FeedPage() {
  const { user, setUser } = useStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('for-you');
  const [content, setContent] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('0.1');

  // Modals state
  const [stealPost, setStealPost] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['posts', tab],
    queryFn: async () => {
      const res = await fetch(`/api/posts/feed?tab=${tab}`);
      return res.json();
    }
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, usdcAmount: parseFloat(usdcAmount) })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      setContent('');
      toast.success('Post published! Your USDC is locked in.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (user) setUser({ ...user, usdcBalance: user.usdcBalance - parseFloat(usdcAmount) });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const stealMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/steal/${postId}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: (data) => {
      toast.success(`You successfully stole the post for ${data.post.usdcAmountLocked} USDC!`);
      setStealPost(null);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      fetch('/api/auth/me').then(res => res.json()).then(d => { if(d.user) setUser(d.user); });
    },
    onError: (err: any) => toast.error(err.message)
  });

  if (!user) return null;

  const cost = parseFloat(usdcAmount) || 0;
  const stealPrice = cost * 2;
  const canPost = content.trim().length > 0 && cost >= 0.1 && user.usdcBalance >= cost;

  return (
    <div className="flex flex-col w-full h-full relative">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 flex items-center h-[52px] px-4">
        <h1 className="text-xl font-bold font-sans">Home</h1>
      </div>

      {/* Composer */}
      <div className="p-4 border-b border-gray-100 bg-white flex gap-4">
        <Avatar className="w-10 h-10 border border-purple-100 shadow-sm">
          <AvatarImage src={user.avatarUrl} className="object-cover" />
          <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">{user.displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea 
            placeholder="What's worth paying for?" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-none focus-visible:ring-0 text-xl resize-none min-h-[80px] p-0 placeholder:text-gray-400 mb-2"
            maxLength={280}
          />
          
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 w-24">Post Cost</span>
                <div className="relative w-32">
                   <Input 
                      type="number" 
                      min="0.1" 
                      step="0.1" 
                      value={usdcAmount}
                      onChange={(e) => setUsdcAmount(e.target.value)}
                      className="pl-2 pr-12 h-8 text-sm font-semibold text-purple-700 bg-purple-50 border-purple-200 focus-visible:ring-purple-500 rounded-md geist-mono"
                   />
                   <span className="absolute right-3 top-2 text-xs text-purple-400 geist-mono font-bold pointer-events-none">USDC</span>
                </div>
                {cost < 0.1 && <span className="text-xs text-red-500">Min 0.1 USDC</span>}
             </div>
             
             <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center text-sm border border-gray-100">
                <span className="text-gray-500">Steal price will be <b className="geist-mono text-purple-600">{stealPrice.toFixed(2)} USDC</b></span>
                <span className={`${user.usdcBalance < cost ? 'text-red-500 font-bold' : 'text-gray-500'}`}>Balance: <b className="geist-mono">{user.usdcBalance.toFixed(2)} USDC</b></span>
             </div>
             
             <div className="flex justify-end pt-2">
               <Button 
                  onClick={() => postMutation.mutate()} 
                  disabled={!canPost || postMutation.isPending}
                  className="rounded-full px-6 bg-purple-600 hover:bg-purple-700 font-bold"
               >
                 {postMutation.isPending ? 'Posting...' : 'Post'}
               </Button>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full bg-white border-b border-gray-100 rounded-none h-12 p-0 justify-around">
          <TabsTrigger value="for-you" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent shadow-none px-8 py-3">For You</TabsTrigger>
          <TabsTrigger value="trending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent shadow-none px-8 py-3">Trending</TabsTrigger>
          <TabsTrigger value="most-stolen" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent shadow-none px-8 py-3">Most Stolen</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feed Area */}
      <div className="flex-1 bg-white min-h-screen pb-20">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading stakes...</div>
        ) : (
          data?.posts?.map((post: any) => (
             <PostCard 
                key={post.id} 
                post={post} 
                onSteal={() => {
                  if (post.currentOwnerId === user.id) {
                    toast.error("You cannot steal your own post!");
                  } else {
                    setStealPost(post);
                  }
                }}
                onReply={(id:string) => alert(`Reply to ${id} coming soon to UI`)}
                onBoost={(id:string) => alert(`Boost ${id} coming soon`)}
             />
          ))
        )}
        
        {data?.posts?.length === 0 && (
          <div className="p-8 text-center text-gray-500">No posts yet. Be the first to lock in USDC!</div>
        )}
      </div>

      {/* Steal Modal */}
      <Dialog open={!!stealPost} onOpenChange={(o) => !o && setStealPost(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-900 instrument-serif">Steal This Post?</DialogTitle>
            <DialogDescription className="text-gray-500">
              You are about to pay double the locked amount to claim ownership.
            </DialogDescription>
          </DialogHeader>
          {stealPost && (
            <div className="py-4">
               <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl mb-4 text-sm text-gray-700 line-clamp-2 italic">"{stealPost.content}"</div>
               <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Original Author</span>
                    <span className="font-semibold text-gray-900">@{stealPost.author.username}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current Owner</span>
                    <span className="font-semibold text-purple-700">@{stealPost.currentOwner.username}</span>
                  </div>
                  <hr className="border-purple-200 my-1"/>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">You Pay:</span>
                    <span className="font-bold geist-mono text-gray-900">{stealPost.stealPrice.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Owner Receives:</span>
                    <span className="font-bold geist-mono text-green-600">{stealPost.stealPrice.toFixed(2)} USDC</span>
                  </div>
                  <hr className="border-purple-200 my-1"/>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Your Balance:</span>
                    <span className="font-bold geist-mono text-gray-900">{user.usdcBalance.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>After Steal:</span>
                    <span className="geist-mono">{(user.usdcBalance - stealPost.stealPrice).toFixed(2)} USDC</span>
                  </div>
               </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStealPost(null)}>Cancel</Button>
            <Button 
               disabled={user.usdcBalance < (stealPost?.stealPrice || 0) || stealMutation.isPending} 
               onClick={() => stealMutation.mutate(stealPost.id)}
               className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {user.usdcBalance < (stealPost?.stealPrice || 0) ? 'Insufficient Balance' : `Confirm Steal — ${stealPost?.stealPrice.toFixed(2)} USDC`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
