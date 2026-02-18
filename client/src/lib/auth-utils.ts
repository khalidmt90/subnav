import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from './supabaseClient';
import { queryClient } from './queryClient';

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    window.location.href = "/api/login";
  }, 500);
}

// OAuth handling for Capacitor
let authChangeListener: (() => void) | null = null;

/**
 * Initialize OAuth deep link handling for Capacitor apps
 */
export function initializeOAuthHandler() {
  // Only set up listener once
  if (authChangeListener) {
    console.log('⚠️ OAuth handler already initialized');
    return;
  }

  console.log('🎬 Initializing OAuth deep link handler...');
  console.log('📱 Platform:', window.location.protocol);
  console.log('🔧 Is native app:', isNativeApp());

  // Listen for deep links (when app opens from URL scheme)
  authChangeListener = CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
    console.log('🔗 App opened with URL:', url);

    // Check if this is an OAuth callback
    if (url.includes('auth/callback')) {
      console.log('✅ OAuth callback detected');

      // Close the browser window
      try {
        await Browser.close();
        console.log('🚪 Browser closed');
      } catch (e) {
        console.log('Browser already closed');
      }

      // Extract the URL hash/query parameters
      try {
        const urlObj = new URL(url);
        console.log('📍 URL parsed:', {
          hash: urlObj.hash,
          search: urlObj.search,
        });

        // Try to get tokens from hash first (Supabase default)
        let hashParams = new URLSearchParams(urlObj.hash.substring(1));
        let access_token = hashParams.get('access_token');
        let refresh_token = hashParams.get('refresh_token');
        let provider_token = hashParams.get('provider_token'); // Google access token!

        // If not in hash, try query params
        if (!access_token) {
          console.log('🔍 Tokens not in hash, checking query params');
          const queryParams = new URLSearchParams(urlObj.search);
          access_token = queryParams.get('access_token');
          refresh_token = queryParams.get('refresh_token');
          provider_token = queryParams.get('provider_token');
        }

        console.log('🔑 Token found:', !!access_token);
        console.log('🔑 Provider token found:', !!provider_token);

        if (access_token) {
          console.log('🔄 Setting session...');
          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });

          if (error) {
            console.error('❌ Error setting session:', error);
            alert('Failed to set session: ' + error.message);
          } else {
            console.log('✅ Session set successfully:', data.session?.user?.email);

            // Store Google access token in localStorage (Supabase doesn't persist it)
            if (provider_token) {
              localStorage.setItem('google_access_token', provider_token);
              console.log('💾 Stored Google access token');
            }

            // Sync with backend (with timeout)
            console.log('🔄 Syncing with backend...');
            try {
              // Use configured backend URL from environment variable
              const isNative = window.location.protocol === 'capacitor:';
              const baseUrl = isNative
                ? (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001')
                : '';
              const backendUrl = `${baseUrl}/api/auth/login`;

              console.log('📍 Backend URL:', backendUrl);
              console.log('📦 Request payload:', {
                email: data.session?.user?.email,
                displayName: data.session?.user?.user_metadata?.full_name,
                provider: 'google',
              });

              // Add timeout to fetch
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

              const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  email: data.session?.user?.email,
                  displayName: data.session?.user?.user_metadata?.full_name,
                  provider: 'google',
                }),
                signal: controller.signal,
              });

              clearTimeout(timeout);

              if (response.ok) {
                const loginData = await response.json();
                console.log('✅ Backend session created');

                // Store session ID for mobile apps
                if (loginData.sessionId) {
                  localStorage.setItem('backend_session_id', loginData.sessionId);
                  console.log('💾 Stored backend session ID');
                }

                // Invalidate auth query cache so dashboard can detect we're logged in
                console.log('🔄 Invalidating auth cache...');
                queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
                console.log('✅ Auth cache invalidated');
              } else {
                const errorText = await response.text();
                console.error('❌ Backend login failed:', response.status, errorText);
              }
            } catch (backendError: any) {
              console.error('❌ Error syncing with backend:', {
                name: backendError?.name,
                message: backendError?.message,
                stack: backendError?.stack,
              });
              // Don't block login if backend sync fails
              console.warn('⚠️ Continuing to app despite backend sync failure');
            }

            console.log('🚀 Navigating to connect-gmail...');
            // Navigate to connect-gmail page (not dashboard yet)
            window.location.replace('/connect-gmail');
          }
        } else {
          console.error('❌ No access token found in URL');
          alert('No access token found in callback URL');
        }
      } catch (error) {
        console.error('❌ Error parsing OAuth callback:', error);
        alert('OAuth error: ' + (error as Error).message);
      }
    }
  }).remove;
}

/**
 * Cleanup OAuth handler
 */
export function cleanupOAuthHandler() {
  if (authChangeListener) {
    authChangeListener();
    authChangeListener = null;
  }
}

/**
 * Check if running in Capacitor (native app)
 */
export function isNativeApp(): boolean {
  return window.location.protocol === 'capacitor:';
}

/**
 * Get the appropriate redirect URL for OAuth
 */
export function getOAuthRedirectUrl(): string {
  if (isNativeApp()) {
    return 'com.khalid.subscriptionsradar://auth/callback';
  }
  return window.location.origin + '/auth/callback';
}

/**
 * Handle OAuth with in-app browser for better UX
 */
export async function signInWithOAuthInApp(provider: 'google' | 'apple') {
  try {
    const redirectUrl = getOAuthRedirectUrl();
    console.log('🔗 OAuth redirect URL:', redirectUrl);

    // Get the OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true, // Don't auto-redirect, we'll handle it
        scopes: 'https://www.googleapis.com/auth/gmail.readonly', // Request Gmail read access
      }
    });

    if (error) throw error;

    // Open in-app browser on native, regular browser on web
    if (data?.url) {
      console.log('📍 OAuth URL generated:', data.url);

      if (isNativeApp()) {
        console.log('📱 Opening in-app browser...');
        try {
          // Try to open in-app browser
          await Browser.open({
            url: data.url,
            presentationStyle: 'fullscreen',
            toolbarColor: '#0B0C14',
          });
          console.log('✅ In-app browser opened successfully');
        } catch (browserError) {
          console.error('❌ In-app browser failed:', browserError);
          console.log('⚠️ Falling back to system browser');
          // Fallback to system browser
          window.location.href = data.url;
        }
      } else {
        // On web, just redirect normally
        console.log('🌐 Web platform - redirecting normally');
        window.location.href = data.url;
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('❌ OAuth error:', error);
    return { data: null, error };
  }
}
