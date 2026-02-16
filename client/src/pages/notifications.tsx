import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Bell, CheckCircle2, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function Notifications() {
  const { t, language } = useLanguage();
  const { notifications, isLoading, markRead, markAllRead } = useNotifications();

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-notifications-title">{t('notifications')}</h1>
        <button
          onClick={() => markAllRead()}
          className="text-primary text-sm font-medium"
          data-testid="button-mark-all-read"
        >
          {language === 'ar' ? 'قراءة الكل' : 'Mark all read'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => !notif.isRead && markRead(notif.id)}
              data-testid={`card-notification-${notif.id}`}
              className={`p-4 rounded-2xl flex gap-4 cursor-pointer ${notif.isRead ? 'bg-surface/50' : 'bg-surface border-l-4 border-primary'}`}
            >
              <div className="mt-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-foreground" data-testid={`text-notif-title-${notif.id}`}>{notif.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed" data-testid={`text-notif-message-${notif.id}`}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p>{t('no_renewals_week')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
