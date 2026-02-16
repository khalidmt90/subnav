import React from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { Home, Settings, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { id: 'dashboard', icon: Home, label: t('dashboard'), path: '/dashboard' },
    { id: 'notifications', icon: Bell, label: t('notifications'), path: '/notifications' },
    { id: 'settings', icon: Settings, label: t('settings'), path: '/settings' },
  ];

  if (location === '/' || location === '/login' || location === '/onboarding') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur-md pb-safe pt-2 px-6">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => setLocation(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("w-6 h-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
