import { createContext } from 'react';
import type { AuthContextType } from './AuthContext.types';
import type { AuthState } from '../types';

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null,
};

// Create context
export const AuthContext = createContext<AuthContextType>({
  state: initialState,
  register: async () => {},
  login: async () => {},
  loadUser: async () => {},
  logout: () => {},
  clearErrors: () => {},
});
