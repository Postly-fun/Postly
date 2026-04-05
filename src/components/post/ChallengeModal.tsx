'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Sword, Loader2 } from 'lucide-react';

export default function ChallengeModal({ 
  isOpen, 
  onClose, 
  challengedPost 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  challengedPost: any 
}) {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Fetch current user's active posts that are NOT in a match
  const { data: myPosts, isLoading } = useQuery({
    queryKey: ['my-eligible-posts'],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${user?.username}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      return json.user.ownedPosts.filter((p: any) => p.isActive && !p.inVersusMatch) || [];
    },
    enabled: isOpen && !!user
  });

  const challengeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/versus/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          challengerPostId: selectedPostId,
          challengedPostId: challengedPost.id
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Challenge Sent! Waiting for them to accept.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message)
  });

  if (!challengedPost) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sword className="text-orange-500 w-5 h-5" />
            Issue a Versus Challenge
          </DialogTitle>
          <DialogDescription>
            Select one of your active posts to pit against @{challengedPost.author.username}'s post. If accepted, whoever makes more profit in 24 hours wins the locked USDC from both posts!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
          ) : myPosts?.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">You don't have any eligible active posts to challenge with. Create a new post first!</p>
          ) : (
            myPosts?.map((post: any) => (
              <div 
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedPostId === post.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
              >
                <div className="flex-1 truncate pr-4 text-sm font-medium text-gray-800">
                  {post.content || (post.imageUrl ? 'Image Post' : 'Voice Message')}
                </div>
                <div className="font-bold font-mono text-orange-600 flex-shrink-0 text-sm">
                  {post.usdcAmountLocked.toFixed(2)} USDC
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            disabled={!selectedPostId || challengeMutation.isPending} 
            onClick={() => challengeMutation.mutate()}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
          >
            {challengeMutation.isPending ? 'Sending...' : 'Send Challenge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
