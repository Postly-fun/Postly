'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, User as UserIcon, ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/users/leaderboard');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-yellow-100 rounded-2xl">
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Postly Leaderboard</h1>
          <p className="text-gray-500 text-sm">Top earners across the platform</p>
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user, index) => (
          <Link 
            key={user.id} 
            href={`/app/profile/${user.username}`}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-center font-bold text-gray-400">
                {index === 0 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> : 
                 index === 1 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> :
                 index === 2 ? <Medal className="w-6 h-6 text-amber-600 mx-auto" /> :
                 `#${index + 1}`}
              </div>
              
              <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {user.displayName}
                </h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 geist-mono">
                {user.totalEarned.toFixed(2)} USDC
              </div>
              <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                Total Earned <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}

        {users.length === 0 && (
          <div className="text-center py-20 grayscale opacity-50">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No earnings recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
