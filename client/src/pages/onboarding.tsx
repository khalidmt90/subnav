import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { AppLogo } from '@/components/AppLogo';
import { ArrowLeft, ArrowRight, Bell, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon Components for Slides
const IconRadar = () => <AppLogo size={140} showHalo={true} />;

const IconBell = () => (
  <div className="w-[140px] h-[140px] rounded-[38px] bg-gradient-to-br from-[#1C1F4A] to-[#0F3B4A] border border-[rgba(91,108,248,0.25)] flex items-center justify-center shadow-[0_8px_32px_rgba(91,108,248,0.3)] relative overflow-hidden">
    <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
    <Bell className="w-16 h-16 text-[#FAC06D] drop-shadow-[0_0_15px_rgba(250,192,109,0.5)]" strokeWidth={1.5} />
  </div>
);

const IconShield = () => (
  <div className="w-[140px] h-[140px] rounded-[38px] bg-gradient-to-br from-[#1C1F4A] to-[#0F3B4A] border border-[rgba(91,108,248,0.25)] flex items-center justify-center shadow-[0_8px_32px_rgba(91,108,248,0.3)] relative overflow-hidden">
    <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
    <ShieldCheck className="w-16 h-16 text-[#2DD4BF] drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" strokeWidth={1.5} />
  </div>
);

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const SLIDES = [
    {
      id: 'scan',
      Icon: IconRadar,
      title: 'رادار الاشتراكات',
      taglineAr: ['نكتشف اشتراكاتك ', 'تلقائياً', ' من بريدك الإلكتروني', '\nدون أي جهد منك'],
      taglineEn: ['We automatically detect your subscriptions', '\nfrom your email — zero effort required'],
      cta: { ar: 'التالي', en: 'Next' },
    },
    {
      id: 'notify',
      Icon: IconBell,
      title: { ar: 'تنبيهات قبل التجديد', en: 'Alerts Before Renewal' },
      taglineAr: ['نُخبرك قبل ', '٣ أيام', ' من أي تجديد تلقائي', '\nحتى تتحكم في مصروفك'],
      taglineEn: ['We notify you ', '3 days', ' before any auto-renewal', '\nso you stay in control'],
      cta: { ar: 'التالي', en: 'Next' },
    },
    {
      id: 'control',
      Icon: IconShield,
      title: { ar: 'تحكم كامل', en: 'Full Control' },
      taglineAr: ['ألغِ أو أخفِ أي اشتراك بضغطة واحدة', '\nوتابع ', 'إجمالي', ' مصاريفك الشهرية'],
      taglineEn: ['Cancel or hide any subscription in one tap', '\nTrack your ', 'total', ' monthly spend'],
      cta: { ar: 'ابدأ الآن', en: 'Get Started' },
    },
  ];

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setLocation('/login');
    }
  };

  const currentData = SLIDES[currentSlide];
  const title = typeof currentData.title === 'string' ? currentData.title : (language === 'ar' ? currentData.title.ar : currentData.title.en);
  const tagline = language === 'ar' ? currentData.taglineAr : currentData.taglineEn;
  const ctaText = language === 'ar' ? currentData.cta.ar : currentData.cta.en;

  // Helper to render tagline with highlighted parts
  const renderTagline = (parts: string[]) => (
    <p className="text-[#8A8AB8] text-center text-lg leading-relaxed mt-4 px-4">
      {parts.map((part, index) => {
        // Simple heuristic: odd indices are highlighted in the data structure provided
        // 'automatically' -> index 1
        // '3 days' -> index 1
        // 'total' -> index 2 in second array structure? 
        // Let's look at the structure: ['text', 'highlight', 'text', 'newline text']
        // It varies. Let's just check if it's short and matches specific keywords or just alternate styles?
        // The spec implies specific highlights.
        // Array indices 1 and 2 seem to be potential highlights based on the provided data.
        
        const isHighlight = 
          (currentData.id === 'scan' && index === 1) ||
          (currentData.id === 'notify' && index === 1) ||
          (currentData.id === 'control' && index === 2);
          
        return (
          <span key={index} className={isHighlight ? "text-[#F0F0FA] font-bold" : ""}>
            {part}
          </span>
        );
      })}
    </p>
  );

  return (
    <div className="flex flex-col h-full bg-[#0B0C14] text-[#F0F0FA] overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5B6CF8]/20 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[40%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8B5CF6]/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-10">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="mb-10 scale-110">
              <currentData.Icon />
            </div>
            
            <h1 className="text-[34px] font-bold text-center mb-2 px-6 leading-tight">
              {title}
            </h1>
            
            {renderTagline(tagline)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="w-full px-8 pb-12 pt-6 flex flex-col items-center relative z-20">
        {/* Pagination Dots */}
        <div className="flex gap-2 mb-8">
          {SLIDES.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === currentSlide ? "w-8 bg-[#5B6CF8]" : "w-2 bg-[#1C1D2E]"
              )}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleNext}
          className="w-full h-[56px] bg-gradient-to-r from-[#5B6CF8] to-[#8B5CF6] rounded-[18px] flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(91,108,248,0.4)]"
        >
          <span className="text-lg font-bold text-white">{ctaText}</span>
          {isRTL ? <ArrowLeft className="w-5 h-5 text-white" /> : <ArrowRight className="w-5 h-5 text-white" />}
        </motion.button>
      </div>
    </div>
  );
}
