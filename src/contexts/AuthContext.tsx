import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { auth } from '../lib/firebase';
import type { User } from '../types';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, firstName: string, lastName: string, studentId?: string) => Promise<User>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          firstName: userData.firstName,
          lastName: userData.lastName,
          displayName: userData.displayName,
          role: userData.role,
          status: userData.status,
          studentId: userData.studentId,
          createdAt: userData.createdAt?.toDate(),
          updatedAt: userData.updatedAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // On initial load, get the authenticated user from Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const userData = await fetchUserData(firebaseUser);
      
      if (!userData) {
        throw new Error('User data not found');
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Signed in successfully');
      return userData;
    } catch (error) {
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, studentId?: string) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = firebaseUser;
      const displayName = `${firstName} ${lastName}`;
      const authUser = { 
        id: uid, 
        email, 
        firstName,
        lastName,
        displayName,
        role: 'user',
        studentId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', uid), authUser);
      
      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
      toast.success('Account created successfully');
      return authUser;
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
      await firebaseSignOut(auth);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
