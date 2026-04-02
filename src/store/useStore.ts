import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  xHandle?: string;
  telegramHandle?: string;
  walletAddress: string;
  usdcBalance: number;
}

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateBalance: (newBalance: number) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isAuthModalOpen: boolean) => void;
  isCreatePostModalOpen: boolean;
  setCreatePostModalOpen: (isCreatePostModalOpen: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateBalance: (newBalance) => set((state) => ({ 
    user: state.user ? { ...state.user, usdcBalance: newBalance } : null 
  })),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
  isAuthModalOpen: false,
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  isCreatePostModalOpen: false,
  setCreatePostModalOpen: (isCreatePostModalOpen) => set({ isCreatePostModalOpen }),
}));
