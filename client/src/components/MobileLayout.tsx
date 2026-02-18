import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { BottomNav } from './BottomNav';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const { dir } = useLanguage();

  return (
    <div className="h-full w-full bg-neutral-950 flex justify-center items-start sm:items-start sm:pt-8 sm:pb-8">
      <div
        dir={dir}
        className="w-full sm:max-w-[400px] h-full sm:h-[800px] bg-background sm:rounded-[32px] sm:border-[8px] sm:border-neutral-800 shadow-2xl overflow-hidden relative flex flex-col"
      >
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
