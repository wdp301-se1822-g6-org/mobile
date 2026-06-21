import { User } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  authUser: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;

  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  initAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      authUser: null,
      isLoggedIn: false,
      isInitialized: false,

      login: (accessToken, refreshToken, user) => {
        set({ accessToken, refreshToken, authUser: user, isLoggedIn: true });
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, authUser: null, isLoggedIn: false });
      },

      setUser: (user) => set({ authUser: user }),

      initAuth: async () => {
        const { accessToken } = get();
        set({ isLoggedIn: !!accessToken, isInitialized: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        authUser: state.authUser,
      }),
    },
  ),
);
