import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function Notifications() {
  const { t } = useLanguage();

  const notifications = [
    { id: 1, title: 'Netflix', message: t('notification_body_amount', { title: 'Netflix', when: t('days_left_1'), amount: '49' }), time: '2h', read: false },
    { id: 2, title: 'Spotify', message: t('notification_body_no_amount', { title: 'Spotify', when: t('renews_today') }), time: '5h', read: true },
  ];

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('notifications')}</h1>
        <button className="text-primary text-sm font-medium">{t('show_all')}</button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className={`p-4 rounded-2xl flex gap-4 ${notif.read ? 'bg-surface/50' : 'bg-surface border-l-4 border-primary'}`}
          >
            <div className="mt-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-foreground">{notif.title}</h3>
                <span className="text-xs text-muted-foreground">{notif.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
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
    </div>
  );
}
