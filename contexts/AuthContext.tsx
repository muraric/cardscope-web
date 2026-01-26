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

  // Check for existing user in localStorage (define outside useEffect for reuse)
  const checkAuth = () => {
    try {
      // Check if localStorage is available (might not be in some contexts)
      if (typeof localStorage === 'undefined') {
        console.log('⚠️ localStorage not available');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const storedUser = localStorage.getItem('cardscope_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ User found in localStorage:', userData.email);
      } else {
        setUser(null);
        console.log('❌ No user found in localStorage');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Check for pending deep link stored by native code
    const checkPendingDeepLink = () => {
      try {
        const pendingDeepLink = localStorage.getItem('pendingDeepLink');
        if (pendingDeepLink && pendingDeepLink.includes('cardscope://')) {
          console.log('📱 Found pending deep link in localStorage:', pendingDeepLink);
          localStorage.removeItem('pendingDeepLink'); // Clear it so we don't process again
          handleDeepLinkUrl(pendingDeepLink);
        }
      } catch (e) {
        console.log('Error checking pending deep link:', e);
      }
    };

    // Check immediately and after a delay (in case native code sets it after React mounts)
    checkPendingDeepLink();
    const pendingCheckTimeout = setTimeout(checkPendingDeepLink, 1000);
    const pendingCheckTimeout2 = setTimeout(checkPendingDeepLink, 2000);

    // Listen for deep link from Capacitor (for mobile)
    if (Capacitor.isNativePlatform()) {
      console.log('📱 Setting up deep link listeners...');

      // Listen for Capacitor's appUrlOpen event
      const handleAppUrlOpen = (event: any) => {
        console.log('📱 Received appUrlOpen event:', event.detail?.url);
        if (event.detail?.url && event.detail.url.includes('cardscope://')) {
          handleDeepLinkUrl(event.detail.url);
        }
      };

      window.addEventListener('appUrlOpen', handleAppUrlOpen);

      // Also listen for custom deepLink event
      const handleDeepLinkEvent = (event: any) => {
        console.log('📱 Received deepLink event from native:', event.detail);
        handleDeepLinkUrl(event.detail);
      };

      window.addEventListener('deepLink', handleDeepLinkEvent);

      // Also check window.location periodically for deep links
      const checkLocation = () => {
        const url = window.location.href;
        if (url && url.includes('cardscope://')) {
          console.log('📱 Found cardscope:// in window.location:', url);
          handleDeepLinkUrl(url);
        }
        // Also check for pending deep link
        checkPendingDeepLink();
      };

      // Check immediately and then every second
      checkLocation();
      const interval = setInterval(checkLocation, 1000);

      // Cleanup listeners on unmount
      return () => {
        window.removeEventListener('appUrlOpen', handleAppUrlOpen);
        window.removeEventListener('deepLink', handleDeepLinkEvent);
        clearInterval(interval);
        clearTimeout(pendingCheckTimeout);
        clearTimeout(pendingCheckTimeout2);
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
