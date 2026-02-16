import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const { t, isRTL, setLanguage } = useLanguage();

  const slides = [
    {
      title: t('onboard_1_title'),
      body: t('onboard_1_body'),
      image: <img src="/logo.png" className="w-24 h-24 object-contain" alt="Logo" />
    },
    {
      title: t('onboard_2_title'),
      body: t('onboard_2_body'),
      image: <span className="text-6xl">🔔</span>
    },
    {
      title: t('onboard_3_title'),
      body: t('onboard_3_body'),
      image: <span className="text-6xl">🛡️</span>
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="flex flex-col h-full p-6 pt-12 bg-background relative">
      <div className="absolute top-6 left-6 right-6 flex justify-between z-10">
        <button 
          onClick={() => setLanguage(isRTL ? 'en' : 'ar')}
          className="px-3 py-1 rounded-full bg-surface-light text-xs font-medium text-muted-foreground"
        >
          {isRTL ? 'English' : 'العربية'}
        </button>
        <button 
          onClick={() => setLocation('/dashboard')} 
          className="text-muted-foreground text-sm font-medium"
        >
          {t('skip')}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
        <AnimatePresence mode='wait'>
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="w-48 h-48 bg-surface-light rounded-full flex items-center justify-center text-6xl mb-8 shadow-2xl shadow-primary/10">
              {slides[step].image}
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-foreground">
              {slides[step].title}
            </h1>
            
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">
              {slides[step].body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto mb-8">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-surface-light'}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          {step === slides.length - 1 ? t('get_started') : t('next')}
          {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
