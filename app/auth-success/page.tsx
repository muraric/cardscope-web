'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const userDataParam = searchParams.get('userData');

    console.log('📱 Auth success page loaded');
    console.log('📱 Status:', status);
    console.log('📱 User data param:', userDataParam);

    if (status === 'success' && userDataParam) {
      try {
        // Decode and parse user data from URL parameter
        const userData = JSON.parse(decodeURIComponent(userDataParam));
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
    } else if (status === 'success') {
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
      console.log('❌ Auth failed or unknown status:', status);
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
