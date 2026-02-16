import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

import { GoogleLogo, AppleLogo } from '@/components/Icons';

export default function Login() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const { login, isLoggingIn } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<'apple' | 'google' | null>(null);

  const handleAppleLogin = async () => {
    setLoadingProvider('apple');
    try {
      await login({ email: "user@icloud.com", displayName: "Apple User", provider: "apple" });
      setLocation('/connect-gmail');
    } catch {
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingProvider('google');
    try {
      await login({ email: "user@gmail.com", displayName: "Google User", provider: "google" });
      setLocation('/connect-gmail');
    } catch {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 pt-12 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5B6CF8]/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center drop-shadow-[0_10px_30px_rgba(91,108,248,0.3)]">
            <img src="/logo.png" alt={t('app_name')} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-white" data-testid="text-app-name">{t('app_name')}</h1>
          <p className="text-[#8A8AB8] text-lg max-w-[280px] mx-auto leading-relaxed">
            {isRTL ? 'سجّل الدخول للمتابعة' : 'Log in or Sign up to continue'}
          </p>
        </motion.div>

        <div className="space-y-4 w-full max-w-sm mx-auto">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleAppleLogin}
            disabled={isLoggingIn}
            data-testid="button-apple-login"
            className="w-full h-[56px] bg-white text-black rounded-[18px] flex items-center justify-center gap-3 shadow-lg relative overflow-hidden group"
          >
            {loadingProvider === 'apple' ? (
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <AppleLogo className="w-6 h-6" />
                <span className="font-bold text-lg">
                  {isRTL ? 'المتابعة باستخدام Apple' : 'Continue with Apple'}
                </span>
              </>
            )}
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            data-testid="button-google-login"
            className="w-full h-[56px] bg-[#1C1D2E] text-white border border-[rgba(255,255,255,0.08)] rounded-[18px] flex items-center justify-center gap-3 shadow-lg relative overflow-hidden"
          >
            {loadingProvider === 'google' ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-1">
                  <GoogleLogo className="w-full h-full" />
                </div>
                <span className="font-bold text-lg">
                  {isRTL ? 'المتابعة باستخدام Google' : 'Continue with Google'}
                </span>
              </>
            )}
          </motion.button>
        </div>

        <p className="mt-8 text-center text-[#7070A0] text-xs px-8 leading-relaxed">
          {isRTL 
            ? 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.' 
            : 'By continuing, you agree to our Terms of Service and Privacy Policy.'}
        </p>
      </div>
    </div>
  );
}
