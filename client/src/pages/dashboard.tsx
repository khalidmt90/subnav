import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { formatCurrency } from '@/lib/utils';
import { Plus, SlidersHorizontal, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { t, language } = useLanguage();

  const subscriptions = [
    { id: '1', name: 'Netflix', amount: 49, renewalDate: new Date(new Date().setDate(new Date().getDate() + 2)), logoColor: '#E50914', category: 'streaming' },
    { id: '2', name: 'Spotify', amount: 21.99, renewalDate: new Date(new Date().setDate(new Date().getDate() + 5)), logoColor: '#1DB954', category: 'streaming' },
    { id: '3', name: 'Adobe Creative Cloud', amount: 235, renewalDate: new Date(new Date().setDate(new Date().getDate() + 12)), logoColor: '#FF0000', category: 'software' },
    { id: '4', name: 'ChatGPT Plus', amount: 89, renewalDate: new Date(new Date().setDate(new Date().getDate() + 18)), logoColor: '#10A37F', category: 'software' },
    { id: '5', name: 'Amazon Prime', amount: 16, renewalDate: new Date(new Date().setDate(new Date().getDate() + 25)), logoColor: '#00A8E1', category: 'streaming', isTrial: true },
  ];

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="text-muted-foreground text-sm">{t('active_subscriptions')}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center border border-border">
          <span className="text-lg">👤</span>
        </div>
      </div>

      {/* Monthly Summary Card */}
      <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="text-white/80 font-medium">{t('monthly_total')}</span>
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-1 font-english tracking-tight">
            {formatCurrency(totalMonthly, language).split(' ')[0]}
            <span className="text-xl font-normal opacity-80 ml-1">
              {formatCurrency(totalMonthly, language).split(' ')[1]}
            </span>
          </h2>
          <p className="text-white/60 text-sm font-medium">{t('monthly_suffix')}</p>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-foreground">{t('renewing_this_week')}</h3>
        <button className="text-primary text-sm font-medium">{t('show_all')}</button>
      </div>

      {/* List */}
      <div className="space-y-1">
        {subscriptions.map((sub, i) => (
          <SubscriptionCard key={sub.id} sub={sub} />
        ))}
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 left-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-20 text-white"
      >
        <Plus className="w-7 h-7" />
      </motion.button>
    </div>
  );
}
