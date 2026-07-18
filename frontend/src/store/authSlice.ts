import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
}

const getStoredUser = (): UserSession | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch (e) {
    console.error('Failed to parse stored user session', e);
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: UserSession; accessToken: string }>) => {
      const { user, accessToken } = action.payload;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setVerified: (state) => {
      if (state.user) {
        state.user.isVerified = true;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { login, logout, setVerified } = authSlice.actions;
export default authSlice.reducer;
