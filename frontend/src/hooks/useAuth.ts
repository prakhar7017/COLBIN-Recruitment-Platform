import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.ts';
import type { AuthContextType } from '../context/AuthContext.types';

// Custom hook to use auth context
export const useAuth = (): AuthContextType => useContext(AuthContext);
