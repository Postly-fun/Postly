import Link from 'next/link';
import { Home, Bell, User as UserIcon, Wallet, Settings, Trophy, Sparkles, LogOut, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { clearAuthCookie } from '@/lib/auth';

export default function Sidebar({ currentPath, user, mobile = false }: any) {
  const router = useRouter();
  
  const { setAuthModalOpen, setCreatePostModalOpen } = useStore();

  const links = [
    { name: 'Home Feed', href: '/app', icon: Home },
    ...(mobile ? [] : [{ name: 'Notifications', href: '/app/notifications', icon: Bell }]),
    { name: 'Leaderboard', href: '/app/leaderboard', icon: Trophy },
    ...(user ? [{ name: 'Profile', href: `/app/profile/${user.username}`, icon: UserIcon }] : []),
    ...(user ? [{ name: 'Wallet', href: '/app/wallet', icon: Wallet }] : []),
    ...(mobile ? [] : [{ name: 'Settings', href: '/app/settings', icon: Settings }]),
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    window.location.reload();
  };

  if (mobile) {
    return (
      <nav className="flex items-center justify-around w-full">
        {links.map((link) => {
          const isActive = currentPath === link.href;
          return (
            <Link key={link.href} href={link.href} className={`p-3 rounded-full flex flex-col items-center gap-1 ${isActive ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>
              <link.icon className={`w-6 h-6 ${isActive ? 'fill-purple-50' : ''}`} />
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className="w-[260px] h-screen sticky top-0 py-6 px-4 flex flex-col justify-between">
      <div>
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-4 mb-10 group inline-flex">
          <img src="/logo.png" alt="Postly Logo" className="h-12 w-auto object-contain group-hover:scale-105 transition-transform" />
          <span className="text-3xl font-bold text-gray-900 tracking-tight">Postly</span>
        </Link>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-full text-lg font-medium transition-all ${isActive ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <link.icon className={`w-6 h-6 ${isActive ? 'fill-purple-100' : ''}`} />
                  {link.name}
                </div>
              </Link>
            );
          })}
        </nav>
        
        {user ? (
          <Button 
            onClick={() => setCreatePostModalOpen(true)}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full h-12 text-lg shadow-md hover:shadow-lg transition-all"
          >
            New Post
          </Button>
        ) : (
          <Button onClick={() => setAuthModalOpen(true)} className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full h-12 text-lg shadow-md hover:shadow-lg transition-all">
            Join Postly
          </Button>
        )}
      </div>

      <div className="px-2 mt-auto">
        <div className="flex flex-col gap-4 mb-6 px-2">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Community</span>
          <div className="flex gap-4">
            <a href="https://x.com/PostlyDotFun" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-gray-100">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://t.me/+QoH-U7nS0JdiM2Nl" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-gray-100">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M11.944 0C5.344 0 0 5.344 0 11.944c0 6.6 5.344 11.944 11.944 11.944 6.6 0 11.944-5.344 11.944-11.944C23.888 5.344 18.544 0 11.944 0zm5.112 8.333l-1.722 8.111c-.13.578-.472.72-.958.452l-2.617-1.928-1.263 1.217c-.14.14-.257.257-.527.257l.188-2.66 4.842-4.375c.21-.186-.046-.29-.326-.104l-5.986 3.77-2.578-.805c-.56-.175-.572-.56.117-.83l10.07-3.884c.466-.17.872.107.74.777z"/></svg>
            </a>
          </div>
        </div>

        {user ? (
          <>
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white transition-colors cursor-pointer group" onClick={handleLogout}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-white shadow-sm flex items-center justify-center text-purple-700 uppercase font-bold overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    user.displayName.charAt(0)
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm text-gray-900 truncate">{user.displayName}</span>
                  <span className="text-gray-500 text-sm truncate">@{user.username}</span>
                </div>
              </div>
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            </div>
            
            <div className="mt-4 px-3 py-2 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
               <span className="text-xs text-purple-600/70 font-medium">USD Balance</span>
               <span className="geist-mono text-purple-700 font-bold">{user.usdcBalance.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div onClick={() => setAuthModalOpen(true)} className="cursor-pointer">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg hover:shadow-purple-500/20 transition-all font-bold group">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                 <UserIcon className="w-4 h-4" />
              </div>
              Sign In to Postly
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </aside>

  );
}
