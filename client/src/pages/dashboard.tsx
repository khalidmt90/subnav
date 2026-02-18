import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/lib/i18n';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { formatCurrency } from '@/lib/utils';
import { Plus, RefreshCw, Loader2, X, Mail, Search, ArrowDownUp } from 'lucide-react';
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

const KNOWN_SERVICES: { name: string; category: string; logoColor: string }[] = [
  { name: 'Netflix', category: 'streaming', logoColor: '#E50914' },
  { name: 'Spotify', category: 'streaming', logoColor: '#1DB954' },
  { name: 'Apple Music', category: 'streaming', logoColor: '#FA243C' },
  { name: 'YouTube Premium', category: 'streaming', logoColor: '#FF0000' },
  { name: 'Disney+', category: 'streaming', logoColor: '#113CCF' },
  { name: 'Amazon Prime', category: 'streaming', logoColor: '#00A8E1' },
  { name: 'Apple TV+', category: 'streaming', logoColor: '#000000' },
  { name: 'HBO Max', category: 'streaming', logoColor: '#000000' },
  { name: 'Shahid VIP', category: 'streaming', logoColor: '#D50F25' },
  { name: 'OSN+', category: 'streaming', logoColor: '#000000' },
  { name: 'ChatGPT Plus', category: 'software', logoColor: '#10A37F' },
  { name: 'Claude Pro', category: 'software', logoColor: '#D97757' },
  { name: 'Midjourney', category: 'software', logoColor: '#000000' },
  { name: 'GitHub', category: 'software', logoColor: '#24292e' },
  { name: 'Notion', category: 'software', logoColor: '#000000' },
  { name: 'Figma', category: 'software', logoColor: '#F24E1E' },
  { name: 'Adobe Creative Cloud', category: 'software', logoColor: '#FF0000' },
  { name: 'Canva Pro', category: 'software', logoColor: '#00C4CC' },
  { name: 'Microsoft 365', category: 'software', logoColor: '#00A4EF' },
  { name: 'Grammarly', category: 'software', logoColor: '#15C39A' },
  { name: 'Google One', category: 'cloud', logoColor: '#4285F4' },
  { name: 'iCloud+', category: 'cloud', logoColor: '#3693F3' },
  { name: 'Dropbox', category: 'cloud', logoColor: '#0061FF' },
  { name: 'X Premium', category: 'software', logoColor: '#000000' },
  { name: 'LinkedIn Premium', category: 'software', logoColor: '#0A66C2' },
  { name: 'Discord Nitro', category: 'software', logoColor: '#5865F2' },
  { name: 'Telegram Premium', category: 'software', logoColor: '#0088CC' },
  { name: 'Snapchat+', category: 'software', logoColor: '#FFFC00' },
  { name: 'NordVPN', category: 'software', logoColor: '#4687FF' },
  { name: 'ExpressVPN', category: 'software', logoColor: '#DA3940' },
  { name: '1Password', category: 'software', logoColor: '#0094F5' },
  { name: 'PlayStation Plus', category: 'streaming', logoColor: '#003791' },
  { name: 'Xbox Game Pass', category: 'streaming', logoColor: '#107C10' },
  { name: 'Nintendo Online', category: 'streaming', logoColor: '#E60012' },
  { name: 'STC', category: 'telecom', logoColor: '#6F2C91' },
  { name: 'Mobily', category: 'telecom', logoColor: '#76BC21' },
  { name: 'Zain', category: 'telecom', logoColor: '#6E2C91' },
  { name: 'Careem Plus', category: 'food', logoColor: '#00B140' },
  { name: 'Uber One', category: 'food', logoColor: '#000000' },
  { name: 'Jahez', category: 'food', logoColor: '#FF6B00' },
  { name: 'HungerStation', category: 'food', logoColor: '#FF2D55' },
  { name: 'Strava', category: 'streaming', logoColor: '#FC4C02' },
  { name: 'Headspace', category: 'streaming', logoColor: '#F47D31' },
  { name: 'Calm', category: 'streaming', logoColor: '#2DCDDF' },
];

interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  progress: number;
  totalEmails: number;
  processedEmails: number;
  foundSubscriptions: number;
  error?: string;
}

export default function Dashboard() {
  const { t, language, currency, setCurrency } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { subscriptions, isLoading, createSubscription } = useSubscriptions();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({ status: 'idle', progress: 0, totalEmails: 0, processedEmails: 0, foundSubscriptions: 0 });
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    renewalDate: '',
    category: 'streaming',
    isTrial: false,
    currency: 'SAR' as 'SAR' | 'USD',
    logoColor: '',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'high' | 'low'>('default');

  const startYRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getBackendConfig = useCallback(() => {
    const isNative = window.location.protocol === 'capacitor:';
    const backendSessionId = localStorage.getItem('backend_session_id');
    const baseUrl = isNative
      ? (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5001')
      : '';
    return { isNative, backendSessionId, baseUrl };
  }, []);

  const pollSyncStatus = useCallback(() => {
    const { baseUrl, isNative, backendSessionId } = getBackendConfig();

    pollIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await fetch(`${baseUrl}/api/sync-status`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: isNative && backendSessionId ? 'POST' : 'GET',
          body: isNative && backendSessionId ? JSON.stringify({ sessionId: backendSessionId }) : undefined,
        });

        if (statusResponse.ok) {
          const status = await statusResponse.json();
          setSyncProgress(status);

          if (status.status === 'completed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setSyncing(false);
            queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
          } else if (status.status === 'error') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setSyncing(false);
          }
        }
      } catch (error) {
        console.error('Error polling sync status:', error);
      }
    }, 2000);
  }, [getBackendConfig, queryClient]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Check for active sync on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkActiveSync = async () => {
      const { baseUrl, isNative, backendSessionId } = getBackendConfig();
      try {
        const res = await fetch(`${baseUrl}/api/sync-status`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: isNative && backendSessionId ? 'POST' : 'GET',
          body: isNative && backendSessionId ? JSON.stringify({ sessionId: backendSessionId }) : undefined,
        });
        if (res.ok) {
          const status = await res.json();
          setSyncProgress(status);
          if (status.status === 'syncing') {
            setSyncing(true);
            pollSyncStatus();
          }
        }
      } catch (e) {
        // Ignore — sync status check is best-effort
      }
    };

    checkActiveSync();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, getBackendConfig, pollSyncStatus]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  const filteredSubscriptions = subscriptions
    .filter(sub => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return sub.name.toLowerCase().includes(q) || sub.category?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortOrder === 'high') return b.amount - a.amount;
      if (sortOrder === 'low') return a.amount - b.amount;
      return 0;
    });

  const handleGmailSync = async () => {
    setSyncing(true);
    setSyncProgress({ status: 'syncing', progress: 0, totalEmails: 0, processedEmails: 0, foundSubscriptions: 0 });
    try {
      const googleAccessToken = localStorage.getItem('google_access_token');
      const { baseUrl, backendSessionId } = getBackendConfig();

      if (!googleAccessToken) {
        alert(t('please_connect_gmail'));
        setLocation('/connect-gmail');
        setSyncing(false);
        return;
      }

      const syncResponse = await fetch(`${baseUrl}/api/subscriptions/sync-gmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accessToken: googleAccessToken,
          sessionId: backendSessionId,
        }),
      });

      if (!syncResponse.ok) {
        const error = await syncResponse.text();
        setSyncing(false);
        setSyncProgress({ status: 'error', progress: 0, totalEmails: 0, processedEmails: 0, foundSubscriptions: 0, error });
        return;
      }

      pollSyncStatus();

    } catch (error: any) {
      setSyncing(false);
      setSyncProgress({ status: 'error', progress: 0, totalEmails: 0, processedEmails: 0, foundSubscriptions: 0, error: error.message });
    }
  };

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
        currency: newSub.currency,
        logoColor: newSub.logoColor || CATEGORY_COLORS[newSub.category] || '#5B6CF8',
        merchant: newSub.name,
        confidence: 100,
      } as any);
      setShowAddModal(false);
      setNewSub({ name: '', amount: '', renewalDate: '', category: 'streaming', isTrial: false, currency: 'SAR', logoColor: '' });
      setShowSuggestions(false);
    } catch (e: any) {
      console.error('Failed to create subscription:', e);
    } finally {
      setAdding(false);
    }
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (el && el.scrollTop === 0 && !syncing) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || syncing) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, Math.min(currentY - startYRef.current, 120));
    setPullDistance(distance);
  };

  const handleTouchEnd = () => {
    if (pullDistance > 70 && !syncing) {
      handleGmailSync();
    }
    setPullDistance(0);
    setIsPulling(false);
  };

  const categories = ['streaming', 'software', 'food', 'finance', 'telecom', 'cloud', 'other'];

  const showSyncBanner = syncing || syncProgress.status === 'syncing' || syncProgress.status === 'completed';

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Fixed Header */}
      <div className="bg-background border-b border-border/50 px-6 pt-safe-top py-4 shadow-sm z-20 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">{t('dashboard')}</h1>
            <p className="text-muted-foreground text-sm" data-testid="text-active-count">{t('active_subscriptions')}</p>
          </div>
          <button
            onClick={() => setLocation('/settings')}
            className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center border border-border active:scale-95 transition-transform"
            data-testid="button-avatar"
          >
            <span className="text-lg">👤</span>
          </button>
        </div>
      </div>

      {/* Sync Progress Banner */}
      <AnimatePresence>
        {showSyncBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 overflow-hidden z-10"
          >
            <div className="bg-surface border-b border-border/30 px-6 py-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-primary" />
                  {syncing && (
                    <motion.div
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground flex-1">
                  {syncProgress.status === 'completed'
                    ? t('sync_complete')
                    : t('syncing')}
                </span>
                <span className="text-xs text-muted-foreground font-english">
                  {syncProgress.status === 'syncing' && syncProgress.totalEmails > 0
                    ? `${syncProgress.processedEmails}/${syncProgress.totalEmails}`
                    : syncProgress.status === 'completed'
                    ? `${syncProgress.foundSubscriptions} ${t('found_subscriptions', { count: syncProgress.foundSubscriptions })}`
                    : ''}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-border/50 rounded-full overflow-hidden relative">
                {syncProgress.status === 'syncing' && (syncProgress.progress || 0) === 0 ? (
                  <motion.div
                    className="h-full w-1/3 rounded-full absolute"
                    style={{ background: 'linear-gradient(90deg, transparent, #5B6CF8, #818CF8, transparent)' }}
                    animate={{ left: ['-33%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  />
                ) : (
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: syncProgress.status === 'completed'
                        ? '#34C759'
                        : 'linear-gradient(90deg, #5B6CF8, #818CF8)',
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${syncProgress.progress || 0}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                )}
              </div>

              {syncProgress.status === 'syncing' && syncProgress.totalEmails > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {t('scanning_last_90')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar relative overscroll-contain touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        {isPulling && (
          <motion.div
            className="absolute top-0 left-0 right-0 flex justify-center items-center z-50 pointer-events-none"
            style={{ height: pullDistance, opacity: pullDistance / 120 }}
          >
            <motion.div
              className="bg-background rounded-full p-3 shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <RefreshCw
                className={`w-5 h-5 text-primary ${syncing ? 'animate-spin' : ''}`}
              />
            </motion.div>
          </motion.div>
        )}

        <div className="p-6 pb-24">
          <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />

            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-white/80 font-medium">{t('monthly_total')}</span>
                <div className="flex bg-white/10 rounded-full p-0.5">
                  <button
                    onClick={() => setCurrency('SAR')}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${currency === 'SAR' ? 'bg-white/25 text-white' : 'text-white/50'}`}
                  >
                    SAR
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${currency === 'USD' ? 'bg-white/25 text-white' : 'text-white/50'}`}
                  >
                    $
                  </button>
                </div>
              </div>
              <button
                data-testid="button-refresh"
                onClick={handleGmailSync}
                disabled={syncing}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-white ${syncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-1 font-english tracking-tight" data-testid="text-monthly-total">
                {formatCurrency(totalMonthly, language, currency).split(' ')[0]}
                <span className="text-xl font-normal opacity-80 ml-1">
                  {formatCurrency(totalMonthly, language, currency).split(' ')[1]}
                </span>
              </h2>
              <p className="text-white/60 text-sm font-medium">{t('monthly_suffix')}</p>
            </div>
          </div>

          {/* Search & Sort */}
          {subscriptions.length > 0 && (
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث عن اشتراك...' : 'Search subscriptions...'}
                  className="w-full h-10 bg-surface border border-border/50 rounded-xl pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button
                onClick={() => setSortOrder(prev => prev === 'default' ? 'high' : prev === 'high' ? 'low' : 'default')}
                className={`h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all ${
                  sortOrder !== 'default'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface border-border/50 text-muted-foreground'
                }`}
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                {sortOrder === 'high' ? (language === 'ar' ? 'الأعلى' : 'High') : sortOrder === 'low' ? (language === 'ar' ? 'الأقل' : 'Low') : ''}
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-foreground">
              {searchQuery ? (language === 'ar' ? 'نتائج البحث' : 'Results') : t('renewing_this_week')}
            </h3>
            <span className="text-muted-foreground text-xs font-medium">
              {filteredSubscriptions.length} {language === 'ar' ? 'اشتراك' : 'subs'}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">{t('no_subs_yet')}</p>
              <p className="text-sm">{t('add_subs_to_track')}</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">{language === 'ar' ? 'لا توجد نتائج' : 'No results found'}</p>
            </div>
          ) : (
            <motion.div
              className="space-y-1"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {filteredSubscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} sub={{
                  ...sub,
                  renewalDate: new Date(sub.renewalDate),
                }} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        className="absolute bottom-6 left-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-20 text-white"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center touch-none"
            onClick={() => setShowAddModal(false)}
            style={{ position: 'fixed' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#13141F] rounded-t-3xl p-6 border-t border-[rgba(255,255,255,0.1)] max-h-[90dvh] overflow-y-auto overscroll-contain"
              style={{ paddingBottom: 'max(2.5rem, calc(env(safe-area-inset-bottom) + 1.5rem))' }}
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
                <div className="relative">
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{t('sub_name')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                      type="text"
                      value={newSub.name}
                      onChange={(e) => {
                        setNewSub({ ...newSub, name: e.target.value });
                        setShowSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => { if (newSub.name.length > 0) setShowSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder={t('sub_name_placeholder')}
                      data-testid="input-sub-name"
                      className="w-full h-12 bg-[#0B0C14] border border-[rgba(255,255,255,0.1)] rounded-xl pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  {showSuggestions && (() => {
                    const filtered = KNOWN_SERVICES.filter(s =>
                      s.name.toLowerCase().includes(newSub.name.toLowerCase())
                    ).slice(0, 5);
                    if (filtered.length === 0) return null;
                    return (
                      <div className="absolute left-0 right-0 mt-1 bg-[#1C1D2E] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden z-10 shadow-xl">
                        {filtered.map((service) => (
                          <button
                            key={service.name}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setNewSub({ ...newSub, name: service.name, category: service.category, logoColor: service.logoColor });
                              setShowSuggestions(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                          >
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: service.logoColor }} />
                            <span className="text-sm text-foreground font-medium">{service.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{service.category}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{t('sub_amount')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newSub.amount}
                      onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                      placeholder="49"
                      data-testid="input-sub-amount"
                      className="flex-1 h-12 bg-[#0B0C14] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-english"
                    />
                    <div className="flex bg-[#0B0C14] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setNewSub({ ...newSub, currency: 'SAR' })}
                        className={`px-3 h-12 text-xs font-bold transition-all ${newSub.currency === 'SAR' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
                      >
                        SAR
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewSub({ ...newSub, currency: 'USD' })}
                        className={`px-3 h-12 text-xs font-bold transition-all ${newSub.currency === 'USD' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
                      >
                        $
                      </button>
                    </div>
                  </div>
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
