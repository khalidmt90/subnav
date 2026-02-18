import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, Globe, Moon, Bell, Shield, LogOut, DollarSign } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useLocation } from 'wouter';

export default function Settings() {
  const { t, language, setLanguage, currency, setCurrency, isRTL } = useLanguage();
  const { user, updateUser, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  const handleToggleNotifications = async (checked: boolean) => {
    if (user) {
      await updateUser({ notificationsEnabled: checked });
    }
  };

  const handleLanguageToggle = async () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
    if (user) {
      await updateUser({ language: newLang });
    }
  };

  const handleCurrencyToggle = async () => {
    const newCurrency = currency === 'SAR' ? 'USD' : 'SAR';
    setCurrency(newCurrency);
  };

  const sections = [
    {
      title: t('account'),
      items: [
        { icon: Globe, label: t('language'), value: language === 'ar' ? 'العربية' : 'English', action: handleLanguageToggle },
        { icon: DollarSign, label: t('currency'), value: currency === 'SAR' ? t('sar') : t('usd'), action: handleCurrencyToggle },
        { icon: Moon, label: t('theme'), value: t('theme_dark'), toggle: true },
      ]
    },
    {
      title: t('notifications'),
      items: [
        { icon: Bell, label: t('enable_notifications'), toggle: true, defaultChecked: user?.notificationsEnabled ?? true, onToggle: handleToggleNotifications },
        { icon: Bell, label: t('notify_before'), value: t('three_days') },
      ]
    },
    {
      title: t('privacy_section'),
      items: [
        { icon: Shield, label: t('privacy_policy') },
        { icon: LogOut, label: t('logout'), danger: true, action: handleLogout },
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="bg-background border-b border-border/50 px-6 py-4 shadow-sm z-20 flex-shrink-0">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-settings-title">{t('settings')}</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
        <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">{section.title}</h2>
            <div className="bg-surface rounded-2xl overflow-hidden border border-border/50">
              {section.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx}
                  onClick={item.action}
                  data-testid={`button-setting-${idx}-${itemIdx}`}
                  className={`flex items-center justify-between p-4 ${itemIdx !== section.items.length - 1 ? 'border-b border-border/50' : ''} ${item.action ? 'cursor-pointer active:bg-white/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.danger ? 'bg-danger/10 text-danger' : 'bg-surface-light text-primary'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className={`font-medium ${item.danger ? 'text-danger' : 'text-foreground'}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.value && <span className="text-sm text-muted-foreground">{item.value}</span>}
                    {item.toggle && (
                      <Switch
                        defaultChecked={item.defaultChecked}
                        onCheckedChange={(item as any).onToggle}
                      />
                    )}
                    {!item.toggle && !item.value && (
                      isRTL ? <ChevronLeft className="w-5 h-5 text-muted-foreground/50" /> : <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
