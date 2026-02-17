import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Mail } from 'lucide-react';

import { GoogleLogo } from '@/components/Icons';
import { supabase } from '@/lib/supabaseClient';

export default function ConnectGmail() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      console.log("Connecting to Gmail...");
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;

      console.log("Connection successful:", data);
      setLocation('/dashboard');
    } catch (e) {
      console.error("Connection failed:", e);
      alert("Failed to connect to Gmail.");
    } finally {
      setConnecting(false);
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
          disabled={connecting}
          className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
        >
          {connecting ? (
            <span>{t('syncing')}</span>
          ) : (
            <>
              <div className="w-5 h-5">
                <GoogleLogo className="w-full h-full" />
              </div>
              <span>{t('connect_gmail')}</span>
            </>
          )}
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
