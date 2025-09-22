import { useReducer, type ReactNode, useEffect } from "react";
import axios from "axios";
import type { AuthState } from "../types";
import { type AuthAction } from "./AuthContext.types";
import { AuthContext } from "./AuthContext";

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  user: null,
  error: null,
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'REGISTER_REQUEST':
    case 'LOGIN_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload);
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'REGISTER_FAIL':
    case 'LOGIN_FAIL':
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.type === 'AUTH_ERROR' ? 'Authentication error' : action.payload,
      };
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    if (localStorage.token) {
      // Set loading state
      dispatch({ type: 'LOGIN_REQUEST' });
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
      // If no token, don't even try to load user
      return;
    }

    try {
      const res = await axios.get('/api/auth/me');
      if (res.data && res.data.data) {
        dispatch({ type: 'USER_LOADED', payload: res.data.data });
      } else {
        // Invalid response format
        console.error('Invalid user data format');
        dispatch({ type: 'AUTH_ERROR' });
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      dispatch({ type: 'AUTH_ERROR' });
      localStorage.removeItem('token');
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Set loading state
    dispatch({ type: 'REGISTER_REQUEST' });

    try {
      const res = await axios.post(
        '/api/auth/register',
        { name, email, password },
        config
      );
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data.token });
      await loadUser();
    } catch (error: unknown) {
      const errorMessage = 
        error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error ? 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).response?.data?.error || 'Registration failed' : 
          'Registration failed';
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: errorMessage,
      });
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Set loading state
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      const res = await axios.post(
        '/api/auth/login',
        { email, password },
        config
      );
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.token });
      await loadUser();
    } catch (error: unknown) {
      const errorMessage = 
        error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error ? 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).response?.data?.error || 'Invalid credentials' : 
          'Invalid credentials';
      
      dispatch({
        type: 'LOGIN_FAIL',
        payload: errorMessage,
      });
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  // Set auth token on initial app loading
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableLoadUser = () => loadUser();
  
  useEffect(() => {
    // Only load user if we have a token and user is not already loaded
    if (localStorage.token && !state.user && !state.loading) {
      stableLoadUser();
    }
  }, [state.user, state.loading, stableLoadUser]);

  return (
    <AuthContext.Provider
      value={{
        state,
        register,
        login,
        loadUser,
        logout,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
