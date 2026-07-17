import { create } from 'zustand';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  profilePictureUrl?: string;
  phoneNumber?: string;
}

interface AuthState {
  user: UserSession | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: UserSession, accessToken: string) => void;
  logout: () => void;
  setVerified: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setVerified: () => {
    set((state) => {
      if (state.user) {
        return {
          user: { ...state.user, isVerified: true },
        };
      }
      return {};
    });
  },
}));
