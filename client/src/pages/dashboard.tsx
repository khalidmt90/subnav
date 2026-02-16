import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { formatCurrency } from '@/lib/utils';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { subscriptions, isLoading } = useSubscriptions();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">{t('dashboard')}</h1>
          <p className="text-muted-foreground text-sm" data-testid="text-active-count">{t('active_subscriptions')}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center border border-border" data-testid="button-avatar">
          <span className="text-lg">👤</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="text-white/80 font-medium">{t('monthly_total')}</span>
          <button
            data-testid="button-refresh"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] })}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-1 font-english tracking-tight" data-testid="text-monthly-total">
            {formatCurrency(totalMonthly, language).split(' ')[0]}
            <span className="text-xl font-normal opacity-80 ml-1">
              {formatCurrency(totalMonthly, language).split(' ')[1]}
            </span>
          </h2>
          <p className="text-white/60 text-sm font-medium">{t('monthly_suffix')}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-foreground">{t('renewing_this_week')}</h3>
        <button className="text-primary text-sm font-medium" data-testid="button-show-all">{t('show_all')}</button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">{language === 'ar' ? 'لا توجد اشتراكات بعد' : 'No subscriptions yet'}</p>
          <p className="text-sm">{language === 'ar' ? 'أضف اشتراكاتك لتتبع التجديدات' : 'Add your subscriptions to track renewals'}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} sub={{
              ...sub,
              renewalDate: new Date(sub.renewalDate),
            }} />
          ))}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 left-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-20 text-white"
        data-testid="button-add-subscription"
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    </div>
  );
}
