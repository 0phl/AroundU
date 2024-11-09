import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const MOCK_USERS = {
  admin: {
    id: '1',
    email: 'admin@aroundu.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin' as const,
  },
  user: {
    id: '2',
    email: 'user@aroundu.com',
    password: 'user123',
    displayName: 'Regular User',
    role: 'user' as const,
    studentId: 'STU123',
  },
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const mockUser = Object.values(MOCK_USERS).find(u => u.email === email);

      if (!mockUser || mockUser.password !== password) {
        throw new Error('Invalid credentials');
      }

      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      toast.success('Signed in successfully');
      return userWithoutPassword;
    } catch (error) {
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (Object.values(MOCK_USERS).some(u => u.email === email)) {
        throw new Error('Email already in use');
      }

      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        displayName: email.split('@')[0],
        role: 'user' as const,
      };

      setUser(newUser);
      toast.success('Account created successfully');
      return newUser;
    } catch (error) {
      toast.error('Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}