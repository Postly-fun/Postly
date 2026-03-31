import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Gem, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RightSidebar({ user }: any) {
  return (
    <aside className="w-[320px] h-screen sticky top-0 py-6 px-4 hidden xl:block flex-col gap-6">
      
      {/* Search Placeholder */}
      <div className="relative group mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          disabled
          placeholder="Search Postly (Coming Soon)" 
          className="w-full bg-gray-100 text-gray-900 border-none rounded-full py-3 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-500"
        />
      </div>

      {/* Mini Wallet / Join Prompt */}
      {user ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <Gem className="w-5 h-5" />
            <h3 className="font-bold">Your Wallet</h3>
          </div>
          <p className="text-gray-500 text-sm mb-1">Available Balance</p>
          <p className="geist-mono text-3xl text-gray-900 mb-4">{user.usdcBalance.toFixed(2)} <span className="text-lg text-gray-500">USDC</span></p>
          <Link href="/app/wallet">
            <Button className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 geist-mono rounded-full font-bold">
              Manage USDC
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-lg mb-6">
          <h3 className="text-xl font-bold mb-2">Join the Future of Social</h3>
          <p className="text-purple-100 text-sm mb-6">Post, boost, and earn real USDC. Back your words with stakes.</p>
          <Link href="/">
            <Button className="w-full bg-white text-purple-700 hover:bg-gray-100 rounded-full font-bold">
              Sign Up Now
            </Button>
          </Link>
        </div>
      )}

      {/* Trending Posts */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-900">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Most Stolen Options</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">
            More users need to join to calculate trending stats.
          </div>
        </div>
      </div>

    </aside>
  );
}
