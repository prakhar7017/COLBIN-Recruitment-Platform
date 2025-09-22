export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  experience: number;
  education: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  error: string | null;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ProfileFormData {
  name: string;
  skills: string[];
  experience: number;
  education: string;
}
