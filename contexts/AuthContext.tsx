'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('cardscope_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('✅ User found in localStorage:', userData.email);
        } else {
          console.log('❌ No user found in localStorage');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cardscope_user') {
        if (e.newValue) {
          const userData = JSON.parse(e.newValue);
          setUser(userData);
          console.log('✅ User updated from storage:', userData.email);
        } else {
          setUser(null);
          console.log('❌ User removed from storage');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleAuthUpdate = () => {
      checkAuth();
    };

    window.addEventListener('authUpdated', handleAuthUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authUpdated', handleAuthUpdate);
    };
  }, []);

  const signOut = () => {
    localStorage.removeItem('cardscope_user');
    setUser(null);
    console.log('✅ User signed out');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
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
