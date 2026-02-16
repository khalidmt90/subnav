import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [, setLocation] = useLocation();
  const { t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation('/connect-gmail');
  };

  return (
    <div className="flex flex-col h-full p-6 pt-12">
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20 rotate-12">
            <span className="text-3xl">📡</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('app_name')}</h1>
          <p className="text-muted-foreground">{isLogin ? t('login') : t('signup')}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">{t('email')}</label>
            <div className="relative">
              <input 
                type="email" 
                className={`w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors ${isRTL ? 'pl-10 text-right' : 'pr-10 text-left'}`}
                placeholder="name@example.com"
              />
              <Mail className={`absolute top-3.5 text-muted-foreground w-5 h-5 ${isRTL ? 'left-3' : 'right-3'}`} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">{t('password')}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className={`w-full bg-surface border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors ${isRTL ? 'pl-10 text-right' : 'pr-10 text-left'}`}
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-3.5 text-muted-foreground ${isRTL ? 'left-3' : 'right-3'}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button type="button" className="text-sm text-primary font-medium">
                {t('forgot_password')}
              </button>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform mt-4"
          >
            {isLogin ? t('login') : t('signup')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground"
          >
            {isLogin ? (
              <span>
                {t('signup')}
              </span>
            ) : (
              <span>
                {t('login')}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
