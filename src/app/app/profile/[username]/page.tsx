'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { PostCard } from '@/components/post/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Trophy } from 'lucide-react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { user } = useStore();
  const [tab, setTab] = useState('posts');

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', params.username],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${params.username}`);
      return res.json();
    }
  });

  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['content', params.username, tab],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${params.username}/content?tab=${tab}`);
      return res.json();
    }
  });

  if (profileLoading) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;
  
  const profile = profileData?.profile;
  if (!profile) return <div className="p-8 text-center text-red-500">User not found.</div>;

  return (
    <div className="flex flex-col w-full min-h-screen pb-20 bg-white">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 flex items-center h-[52px] px-4">
        <h1 className="text-xl font-bold font-sans">@{profile.username}</h1>
      </div>

      <div className="h-32 bg-gradient-to-br from-purple-200 to-purple-400"></div>

      <div className="px-4 pb-4">
        <div className="flex justify-between items-start -mt-12 mb-4">
          <Avatar className="w-24 h-24 border-4 border-white shadow-sm">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback className="bg-purple-600 text-white text-3xl font-bold">{profile.displayName[0]}</AvatarFallback>
          </Avatar>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">{profile.displayName}</h2>
        <p className="text-gray-500">@{profile.username}</p>
        
        <div className="text-gray-800 mt-4 leading-relaxed whitespace-pre-wrap">
          {profile.bio || "No bio yet. Probably too busy earning USDC."}
        </div>

        <div className="flex gap-6 mt-4 opacity-80">
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-sm text-gray-500 font-medium"><Trophy className="w-4 h-4" /> Earned</span>
            <span className="geist-mono font-bold text-purple-700">{profile.totalEarned.toFixed(2)} USDC</span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-sm text-gray-500 font-medium"><Coins className="w-4 h-4" /> Spent</span>
            <span className="geist-mono font-bold text-red-500">{profile.totalSpent.toFixed(2)} USDC</span>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full bg-white border-b border-gray-100 rounded-none h-12 p-0 justify-around">
          <TabsTrigger value="posts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent shadow-none px-6 py-3">Posts</TabsTrigger>
          <TabsTrigger value="replies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent shadow-none px-6 py-3">Replies</TabsTrigger>
          <TabsTrigger value="owned" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent shadow-none px-6 py-3">Stolen</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex-1 bg-white">
        {contentLoading ? (
           <div className="p-8 text-center text-gray-500">Loading stakes...</div>
        ) : contentData?.content?.length === 0 ? (
           <div className="p-8 text-center text-gray-500">Nothing here yet.</div>
        ) : (
           contentData?.content?.map((item: any) => (
             tab === 'replies' ? (
               <div key={item.id} className="p-4 border-b border-gray-100 bg-white">
                 <div className="flex gap-2">
                   <div className="w-10">
                     <div className="w-0.5 h-full bg-gray-200 mx-auto mt-10"></div>
                   </div>
                   <div className="flex-1 text-sm text-gray-500 mb-2">
                     Replying to <span className="text-purple-600 font-medium">@{item.post.author.username}</span>
                   </div>
                 </div>
                 <div className="flex gap-3">
                    <Avatar className="w-10 h-10 border border-purple-100">
                      <AvatarImage src={profile.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-purple-100 text-purple-700">{profile.displayName[0]}</AvatarFallback>
                    </Avatar>
                   <div className="flex-1">
                     <p className="text-gray-900">{item.content}</p>
                     <p className="geist-mono text-purple-700 text-xs mt-2 font-bold">- 0.05 USDC</p>
                   </div>
                 </div>
               </div>
             ) : (
               <PostCard key={item.id} post={item} onSteal={() => {}} onReply={() => {}} onBoost={() => {}} />
             )
           ))
        )}
      </div>

    </div>
  );
}
