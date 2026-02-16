import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { formatCurrency } from '@/lib/utils';
import { Plus, RefreshCw, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORY_COLORS: Record<string, string> = {
  streaming: '#E50914',
  software: '#5B6CF8',
  food: '#FF8C00',
  finance: '#2DD4BF',
  telecom: '#00A8E1',
  cloud: '#10A37F',
  other: '#8A8AB8',
};

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { subscriptions, isLoading, createSubscription } = useSubscriptions();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    renewalDate: '',
    category: 'streaming',
    isTrial: false,
  });

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

  const handleAddSubscription = async () => {
    if (!newSub.name || !newSub.amount || !newSub.renewalDate) return;
    setAdding(true);
    try {
      await createSubscription({
        name: newSub.name,
        amount: parseFloat(newSub.amount),
        renewalDate: new Date(newSub.renewalDate).toISOString(),
        category: newSub.category,
        isTrial: newSub.isTrial,
        logoColor: CATEGORY_COLORS[newSub.category] || '#5B6CF8',
        merchant: newSub.name,
        confidence: 100,
      } as any);
      setShowAddModal(false);
      setNewSub({ name: '', amount: '', renewalDate: '', category: 'streaming', isTrial: false });
    } catch (e) {
    } finally {
      setAdding(false);
    }
  };

  const categories = ['streaming', 'software', 'food', 'finance', 'telecom', 'cloud', 'other'];

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
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 left-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-20 text-white"
        data-testid="button-add-subscription"
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#13141F] rounded-t-3xl p-6 pb-10 border-t border-[rgba(255,255,255,0.1)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">{t('add_subscription')}</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  data-testid="button-close-modal"
                  className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{t('sub_name')}</label>
                  <input
                    type="text"
                    value={newSub.name}
                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                    placeholder={t('sub_name_placeholder')}
                    data-testid="input-sub-name"
                    className="w-full h-12 bg-[#0B0C14] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{t('sub_amount')}</label>
                  <input
                    type="number"
                    value={newSub.amount}
                    onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                    placeholder="49"
                    data-testid="input-sub-amount"
                    className="w-full h-12 bg-[#0B0C14] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-english"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{t('sub_renewal')}</label>
                  <input
                    type="date"
                    value={newSub.renewalDate}
                    onChange={(e) => setNewSub({ ...newSub, renewalDate: e.target.value })}
                    data-testid="input-sub-date"
                    className="w-full h-12 bg-[#0B0C14] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 text-foreground focus:outline-none focus:border-primary transition-colors font-english [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{t('sub_category')}</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewSub({ ...newSub, category: cat })}
                        data-testid={`button-category-${cat}`}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          newSub.category === cat
                            ? 'bg-primary text-white'
                            : 'bg-[#0B0C14] text-muted-foreground border border-[rgba(255,255,255,0.1)]'
                        }`}
                      >
                        {t(`cat_${cat}` as any)}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer" data-testid="input-sub-trial">
                  <div
                    onClick={() => setNewSub({ ...newSub, isTrial: !newSub.isTrial })}
                    className={`w-10 h-6 rounded-full transition-colors relative ${newSub.isTrial ? 'bg-primary' : 'bg-[rgba(255,255,255,0.1)]'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${newSub.isTrial ? 'right-1' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{t('sub_trial')}</span>
                </label>

                <button
                  onClick={handleAddSubscription}
                  disabled={adding || !newSub.name || !newSub.amount || !newSub.renewalDate}
                  data-testid="button-submit-subscription"
                  className="w-full h-12 bg-primary rounded-xl text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {t('add')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
