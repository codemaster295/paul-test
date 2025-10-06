import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleApiError } from '@/lib/api';
import { User, LoginFormData, RegisterFormData } from '@/types/auth';
import { AxiosError } from 'axios';
import { ErrorResponse } from '@/types/error';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { user } = await authAPI.getProfile();
      setUser(user);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginFormData) => {
    try {
      const { token, user } = await authAPI.login(data);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      throw new Error(handleApiError(error));
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      const { token, user } = await authAPI.register(data);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      throw new Error(handleApiError(error));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}