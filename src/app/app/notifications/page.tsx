'use client';

import { useStore } from '@/store/useStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageSquare, Shuffle, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

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

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/notifications', { method: 'PATCH' });
    }
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
      default: return <Sparkles className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="w-full flex-1 min-h-screen bg-white">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 flex items-center h-[52px] px-4">
        <h1 className="text-xl font-bold font-sans">Notifications</h1>
      </div>

      <div className="divide-y divide-gray-100">
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
          data.notifications.map((notification: any) => (
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
                  <p className="text-[15px] text-gray-900 leading-tight">
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
