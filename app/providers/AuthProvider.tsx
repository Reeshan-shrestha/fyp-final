'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  walletAddress?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('chainbazzar_auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        localStorage.removeItem('chainbazzar_auth_token');
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('chainbazzar_auth_token', token);
      setUser(user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      const { token, user } = response.data;
      
      localStorage.setItem('chainbazzar_auth_token', token);
      setUser(user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('chainbazzar_auth_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 