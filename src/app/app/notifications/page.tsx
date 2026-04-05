'use client';

import { useStore } from '@/store/useStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageSquare, Shuffle, Sparkles, CheckCircle2, Sword } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      return res.json();
    },
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-matches'],
    queryFn: async () => {
      const res = await fetch('/api/versus/pending');
      return res.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/notifications', { method: 'PATCH' });
    }
  });

  const acceptMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const res = await fetch('/api/versus/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Challenge Accepted! The 24-hour match has begun.');
      queryClient.invalidateQueries({ queryKey: ['pending-matches'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  // Automatically mark as read when page is viewed
  useEffect(() => {
    if (data?.notifications?.some((n: any) => !n.isRead)) {
      markReadMutation.mutate();
    }
  }, [data]);

  if (!user) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'STOLEN': return <Shuffle className="w-5 h-5 text-purple-600" />;
      case 'REPLY': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'VERSUS_CHALLENGE': return <Sword className="w-5 h-5 text-orange-500" />;
      case 'VERSUS_ACCEPTED': return <Sword className="w-5 h-5 text-blue-500" />;
      case 'VERSUS_COMPLETED': return <Sparkles className="w-5 h-5 text-green-500" />;
      default: return <Sparkles className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="w-full flex-1 min-h-screen bg-white">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 flex items-center h-[52px] px-4">
        <h1 className="text-xl font-bold font-sans">Notifications</h1>
      </div>

      <div className="divide-y divide-gray-100 pb-10">
        {!pendingLoading && pendingData?.matches?.length > 0 && (
          <div className="bg-orange-50 border-b border-orange-100">
            <div className="px-4 py-3 border-b border-orange-100/50 flex items-center justify-between">
              <span className="font-bold text-orange-800 text-sm">Pending Challenges</span>
              <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full text-xs font-bold">{pendingData.matches.length}</span>
            </div>
            {pendingData.matches.map((match: any) => (
              <div key={match.id} className="p-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Sword className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">@{match.post1.currentOwner.username}</span>
                    <span className="text-gray-600 ml-1 leading-tight block text-[15px]">
                      has challenged your post! The winner of the 24h match takes the combined pool of <strong className="text-orange-600 font-mono">{match.poolAmount.toFixed(2)} USDC</strong>.
                    </span>
                  </div>
                </div>
                <div className="flex pl-13">
                  <Button 
                    size="sm" 
                    onClick={() => acceptMutation.mutate(match.id)}
                    disabled={acceptMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-8"
                  >
                    {acceptMutation.isPending ? 'Accepting...' : 'Accept Challenge'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : data?.notifications?.length === 0 ? (
          <div className="p-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No notifications yet</h3>
            <p className="text-gray-500 text-sm max-w-[240px] mt-1">When people interact with your posts, you'll see it here.</p>
          </div>
        ) : (
          data?.notifications?.map((notification: any) => (
            <Link 
              key={notification.id} 
              href={notification.postId ? `/app/status/${notification.postId}` : '#'}
              className={`flex gap-4 p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-purple-50/30' : ''}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-[15px] text-gray-900 leading-tight whitespace-pre-wrap">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <span className="text-sm text-gray-500 mt-1 inline-block">
                  {formatDistanceToNow(new Date(notification.createdAt))} ago
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {!isLoading && data?.notifications?.length > 0 && (
         <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
               <CheckCircle2 className="w-3 h-3" />
               You've seen all latest updates
            </p>
         </div>
      )}
    </div>
  );
}
