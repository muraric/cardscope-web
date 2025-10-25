'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check URL parameters from Next.js router
    const status = searchParams.get('status');
    const userDataParam = searchParams.get('userData');

    console.log('📱 Auth success page loaded');
    console.log('📱 Status from searchParams:', status);
    console.log('📱 User data param from searchParams:', userDataParam);
    console.log('📱 Current URL:', window.location.href);

    // Also check if URL has query params directly (for deep link handling)
    const urlParams = new URLSearchParams(window.location.search);
    const directStatus = urlParams.get('status');
    const directUserData = urlParams.get('userData');
    
    console.log('📱 Direct URL params - Status:', directStatus);
    console.log('📱 Direct URL params - UserData:', directUserData);

    // Use direct URL params if searchParams doesn't have them
    const finalStatus = status || directStatus;
    const finalUserData = userDataParam || directUserData;
    
    console.log('📱 Final Status:', finalStatus);
    console.log('📱 Final User Data:', finalUserData);

    if (finalStatus === 'success' && finalUserData) {
      try {
        // Decode and parse user data from URL parameter
        const userData = JSON.parse(decodeURIComponent(finalUserData));
        console.log('📱 Parsed user data:', userData);

        // Store user data in localStorage for the native app
        localStorage.setItem('cardscope_user', JSON.stringify(userData));
        
        // Trigger auth update event
        window.dispatchEvent(new Event('authUpdated'));
        
        console.log('✅ User data stored in localStorage');
        
        // Redirect to home page
        setTimeout(() => {
          router.replace('/');
        }, 1000);
        
      } catch (error) {
        console.error('❌ Failed to parse user data:', error);
        // Still redirect to home page
        router.replace('/');
      }
    } else if (finalStatus === 'success') {
      // Success but no user data - check if already authenticated
      const existingUser = localStorage.getItem('cardscope_user');
      if (existingUser) {
        console.log('✅ User already authenticated');
        router.replace('/');
      } else {
        console.log('⚠️ Success but no user data found');
        router.replace('/login');
      }
    } else {
      // Error or other status
      console.log('❌ Auth failed or unknown status:', finalStatus);
      router.replace('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  );
}
