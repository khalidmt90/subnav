import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { BottomNav } from './BottomNav';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex justify-center items-start pt-0 sm:pt-8 pb-0 sm:pb-8">
      <div 
        dir={dir}
        className="w-full sm:max-w-[400px] h-[100dvh] sm:h-[800px] bg-background sm:rounded-[32px] sm:border-[8px] sm:border-neutral-800 shadow-2xl overflow-hidden relative flex flex-col"
      >
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          {children}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
