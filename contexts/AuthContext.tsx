'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';

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

    // Listen for deep link from Capacitor (for mobile)
    if (Capacitor.isNativePlatform()) {
      const checkDeepLink = () => {
        try {
          // Check if window has the deep link URL information
          const url = window.location.href;
          
          // For Capacitor apps, check if we're handling a deep link
          if (url.includes('cardscope://')) {
            console.log('📱 Detected deep link in URL:', url);
            handleDeepLinkUrl(url);
          }
        } catch (error) {
          console.error('Error checking deep link:', error);
        }
      };

      // Check on mount
      setTimeout(checkDeepLink, 100);
      
      // Also listen for hashchange which might be used by Capacitor
      window.addEventListener('hashchange', checkDeepLink);
      
      // Listen for custom deepLink event from Native
      const handleDeepLinkEvent = (event: any) => {
        console.log('📱 Received deepLink event from native:', event.detail);
        handleDeepLinkUrl(event.detail);
      };
      
      window.addEventListener('deepLink', handleDeepLinkEvent);
      
      // Cleanup listener on unmount
      return () => {
        window.removeEventListener('hashchange', checkDeepLink);
        window.removeEventListener('deepLink', handleDeepLinkEvent);
      };
    }

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

  const handleDeepLinkUrl = (url: string) => {
    try {
      console.log('🔗 Processing deep link URL:', url);
      
      // Parse the deep link URL (cardscope://?status=success&userData=... or cardscope://auth-success?status=success&userData=...)
      const urlObj = new URL(url);
      
      // Check if we have status and userData parameters (either path or query params)
      const status = urlObj.searchParams.get('status');
      const userDataParam = urlObj.searchParams.get('userData');
      
      console.log('📱 Deep link status:', status);
      console.log('📱 Deep link userData:', userDataParam);
      
      if (status === 'success' && userDataParam) {
        // Decode and parse user data
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        console.log('📱 Parsed user data from deep link:', userData);
        
        // Store in localStorage
        localStorage.setItem('cardscope_user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        
        // Trigger event
        window.dispatchEvent(new Event('authUpdated'));
        
        console.log('✅ User data stored from deep link');
      }
    } catch (error) {
      console.error('Error processing deep link:', error);
    }
  };

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
