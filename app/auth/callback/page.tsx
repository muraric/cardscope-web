'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      // Redirect back to app with error
      redirectToApp(`error=${encodeURIComponent(error)}`);
      return;
    }

    if (code) {
      // Exchange code for tokens
      exchangeCodeForToken(code);
    } else {
      // No code, redirect back to app
      redirectToApp('no_code');
    }
  }, [searchParams, router]);

  const redirectToApp = (status: string, userData?: any) => {
    // Check if we're in a mobile browser (not native app)
    const isMobileBrowser = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobileBrowser) {
      console.log('Detected mobile browser, attempting app redirect...');
      
      // Prepare the app URL with user data if available
      let appUrl = `cardscope:///?status=${status}`;  // Changed to redirect to home with params
      
      if (userData && status === 'success') {
        // Encode user data as URL parameter
        const encodedUserData = encodeURIComponent(JSON.stringify(userData));
        appUrl += `&userData=${encodedUserData}`;
        console.log('📱 Including user data in redirect:', userData);
        console.log('📱 Full redirect URL:', appUrl);
      }
      
      // Try multiple redirect methods
      // Method 1: Direct location change
      try {
        window.location.href = appUrl;
        console.log('Attempted redirect via window.location.href');
      } catch (error) {
        console.log('Method 1 failed:', error);
      }
      
      // Method 2: Create hidden iframe
      setTimeout(() => {
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = appUrl;
          document.body.appendChild(iframe);
          console.log('Attempted redirect via iframe');
          
          // Remove iframe after attempt
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        } catch (error) {
          console.log('Method 2 failed:', error);
        }
      }, 500);
      
      // Method 3: Try window.open
      setTimeout(() => {
        try {
          window.open(appUrl, '_self');
          console.log('Attempted redirect via window.open');
        } catch (error) {
          console.log('Method 3 failed:', error);
        }
      }, 1000);
      
      // Show fallback message
      setTimeout(() => {
        const message = document.getElementById('message');
        if (message) {
          message.innerHTML = `
            <div style="text-align: center; padding: 20px; max-width: 400px; margin: 0 auto;">
              <h2 style="color: #28a745; margin-bottom: 20px;">✅ Authentication Complete!</h2>
              <p style="margin-bottom: 15px; font-size: 16px;">Your Google account has been successfully linked.</p>
              <p style="margin-bottom: 20px; color: #666;">Please return to the <strong>CardScope</strong> app to continue.</p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #495057;">
                  <strong>How to return to the app:</strong><br>
                  • Swipe up from bottom (Android)<br>
                  • Use recent apps button<br>
                  • Tap the app icon on home screen
                </p>
              </div>
              <button onclick="window.close()" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500;">
                Close Browser
              </button>
            </div>
          `;
        }
      }, 2000);
      
    } else {
      // For web, redirect to home page
      router.push('/');
    }
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const { user } = await response.json();
        
        console.log('✅ Got user from OAuth:', user);
        
        // Store user data in localStorage for web context
        localStorage.setItem('cardscope_user', JSON.stringify(user));
        console.log('✅ Stored user in localStorage');
        
        // Trigger auth update event for same-tab updates
        window.dispatchEvent(new Event('authUpdated'));
        console.log('✅ Dispatched authUpdated event');
        
        // For mobile apps, also try to store via WebView postMessage (Capacitor specific)
        if ((window as any).Capacitor) {
          console.log('📱 Capacitor detected, attempting postMessage to store user data');
          try {
            // Try to store in app context using Capacitor's native bridge
            window.postMessage({
              type: 'OAUTH_SUCCESS',
              user: user
            }, '*');
          } catch (error) {
            console.error('❌ Failed to send postMessage:', error);
          }
        }
        
        // Redirect back to app with user data
        console.log('🔄 Redirecting to app with user data');
        redirectToApp('success', user);
      } else {
        throw new Error('Token exchange failed');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      redirectToApp('error=authentication_failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
        <div id="message" className="mt-4"></div>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
