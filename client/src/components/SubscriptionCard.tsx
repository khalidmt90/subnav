import React from 'react';
import { motion, useMotionValue, PanInfo, useAnimation } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { formatCurrency } from '@/lib/utils';
import { ChevronRight, ChevronLeft, BellOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { useSubscriptions } from '@/hooks/useSubscriptions';

interface SubscriptionProps {
  id: number;
  name: string;
  amount: number;
  renewalDate: Date;
  logoColor: string;
  category: string;
  isTrial?: boolean | null;
  isMuted?: boolean | null;
}

export function SubscriptionCard({ sub }: { sub: SubscriptionProps }) {
  const [, setLocation] = useLocation();
  const { language, isRTL, t, currency } = useLanguage();
  const { updateSubscription, deleteSubscription } = useSubscriptions();
  const controls = useAnimation();
  
  const daysLeft = Math.ceil((sub.renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 3;

  const x = useMotionValue(0);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x < -threshold || info.velocity.x < -500) {
      await controls.start({ x: -140 });
    } else {
      await controls.start({ x: 0 });
    }
  };

  const handleMute = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateSubscription({ id: sub.id, isMuted: !sub.isMuted });
    await controls.start({ x: 0 });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSubscription(sub.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative mb-3 rounded-2xl overflow-hidden bg-background"
      data-testid={`card-subscription-${sub.id}`}
    >
      <div className="absolute inset-y-0 right-0 flex w-[140px]">
        <button
          onClick={handleMute}
          data-testid={`button-mute-${sub.id}`}
          className="flex-1 bg-neutral-800 flex flex-col items-center justify-center text-white gap-1 active:bg-neutral-700 transition-all duration-150 hover:bg-neutral-700"
        >
          <BellOff className="w-5 h-5" />
          <span className="text-[10px]">{t('mute')}</span>
        </button>
        <button
          onClick={handleDelete}
          data-testid={`button-cancel-${sub.id}`}
          className="flex-1 bg-danger flex flex-col items-center justify-center text-white gap-1 active:bg-red-600 transition-all duration-150 hover:bg-red-600"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px]">{t('cancel')}</span>
        </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        onClick={() => setLocation(`/subscription/${sub.id}`)}
        className="bg-surface p-4 flex items-center gap-4 relative z-10 active:cursor-grabbing cursor-grab touch-pan-y transition-shadow duration-200 hover:shadow-lg"
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shrink-0"
          style={{ backgroundColor: sub.logoColor }}
        >
          {sub.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-foreground text-lg leading-tight truncate pr-2" data-testid={`text-name-${sub.id}`}>{sub.name}</h3>
            <span className="font-bold text-foreground font-english shrink-0 text-sm sm:text-base" data-testid={`text-amount-${sub.id}`}>
              {sub.amount > 0 ? formatCurrency(sub.amount, language, currency) : t('amount_unknown')}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-2 min-w-0">
              {sub.isTrial && (
                <span className="px-2 py-0.5 bg-warning/20 text-warning text-[10px] rounded-full font-medium shrink-0 whitespace-nowrap">
                  {t('trial_badge')}
                </span>
              )}
              <span className={cn("text-xs sm:text-sm truncate", isUrgent ? "text-danger font-medium" : "text-muted-foreground")}>
                {daysLeft === 0 ? t('renews_today') : 
                 daysLeft === 1 ? t('renews_tomorrow') : 
                 t('days_left', { days: daysLeft })}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-english opacity-60 shrink-0 ml-1">
               {t('monthly_suffix')}
            </span>
          </div>
        </div>


        {isRTL ? <ChevronLeft className="text-muted-foreground w-4 h-4 opacity-30 shrink-0" /> : <ChevronRight className="text-muted-foreground w-4 h-4 opacity-30 shrink-0" />}
      </motion.div>
    </motion.div>
  );
}
