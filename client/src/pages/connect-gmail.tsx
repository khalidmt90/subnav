import React from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Mail } from 'lucide-react';

import { GoogleLogo } from '@/components/Icons';
import { supabase } from '@/lib/supabaseClient';

export default function ConnectGmail() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleConnect = async () => {
    try {
      // Get the current Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();

      // Get Google access token from localStorage (stored during OAuth callback)
      const googleAccessToken = localStorage.getItem('google_access_token');

      if (error || !session) {
        throw new Error('Not authenticated. Please log in again.');
      }

      if (!googleAccessToken) {
        throw new Error('No Gmail access token found. Please log in again.');
      }

      console.log('✅ Starting background Gmail sync and navigating to dashboard...');

      // Get the backend URL
      const isNative = window.location.protocol === 'capacitor:';
      const baseUrl = isNative
        ? (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001')
        : '';
      const backendUrl = `${baseUrl}/api/subscriptions/sync-gmail`;

      // Get backend session ID for mobile apps
      const backendSessionId = localStorage.getItem('backend_session_id');

      // Start background sync (don't await - fire and forget)
      fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          accessToken: googleAccessToken,
          sessionId: backendSessionId,
        }),
      }).then(response => {
        if (response.ok) {
          console.log('✅ Background sync started successfully');
        } else {
          console.error('❌ Background sync failed to start');
        }
      }).catch(error => {
        console.error('❌ Background sync error:', error);
      });

      // Navigate to dashboard immediately
      console.log('🚀 Navigating to dashboard while sync runs in background...');
      setLocation('/dashboard');

    } catch (error) {
      console.error('❌ Gmail connection error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(t('sync_failed_error', { error: errorMessage }));
    }
  };

  return (
    <div className="flex flex-col h-full p-6 pt-12">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl relative"
        >
          <div className="w-12 h-12">
            <GoogleLogo className="w-full h-full" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-success text-white p-1.5 rounded-full border-4 border-background">
            <Check className="w-4 h-4" strokeWidth={4} />
          </div>
        </motion.div>

        <h1 className="text-2xl font-bold mb-4">{t('connect_gmail')}</h1>
        <p className="text-muted-foreground mb-8 max-w-xs leading-relaxed">
          {t('permission_body')}
        </p>

        <div className="bg-surface/50 p-4 rounded-2xl w-full mb-8 text-right space-y-3 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{t('permission_access_1')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">{t('permission_access_2')}</span>
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
        >
          <div className="w-5 h-5">
            <GoogleLogo className="w-full h-full" />
          </div>
          <span>{t('connect_gmail')}</span>
        </button>

        <button
          onClick={() => setLocation('/dashboard')}
          className="mt-4 text-sm text-muted-foreground"
        >
          {t('skip_for_now')}
        </button>
      </div>
    </div>
  );
}
