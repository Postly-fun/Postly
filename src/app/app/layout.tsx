'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import AuthModal from '@/components/auth/AuthModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, setIsLoading, isLoading, isAuthModalOpen, setAuthModalOpen } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!user) checkAuth();
    else setIsLoading(false);
  }, [user, setUser, setIsLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-purple-600">
        <div className="animate-spin w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Render layout even if user is null (Guest Mode)
  return (
    <div className="flex justify-center min-h-screen app-page bg-transparent text-gray-900 selection:bg-purple-200">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      
      <div className="hidden sm:block">
        <Sidebar currentPath={pathname} user={user} />
      </div>
      
      <main className="flex-1 max-w-[600px] w-full border-x border-purple-100/30 min-h-screen pb-20 md:pb-0 bg-white/60 backdrop-blur-sm">
        {children}
      </main>
      
      <div className="hidden lg:block">
        <RightSidebar user={user} />
      </div>

      {/* Mobile nav placeholder - simplifies UI for this implementation scope */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-around">
        <Sidebar currentPath={pathname} user={user} mobile />
      </div>
    </div>
  );
}
