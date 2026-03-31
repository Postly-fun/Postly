import Link from 'next/link';
import { Home, Bell, User as UserIcon, Wallet, Settings, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { clearAuthCookie } from '@/lib/auth';

export default function Sidebar({ currentPath, user, mobile = false }: any) {
  const router = useRouter();
  
  const links = [
    { name: 'Home Feed', href: '/app', icon: Home },
    ...(mobile ? [] : [{ name: 'Notifications', href: '/app/notifications', icon: Bell }]),
    { name: 'Profile', href: `/app/profile/${user.username}`, icon: UserIcon },
    { name: 'Wallet', href: '/app/wallet', icon: Wallet },
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
        <Link href="/app" className="flex items-center gap-3 px-4 mb-10 group inline-flex">
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
        
        <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full h-12 text-lg shadow-md hover:shadow-lg transition-all">
          New Post
        </Button>
      </div>

      <div className="px-2 mt-auto">
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
      </div>
    </aside>
  );
}
