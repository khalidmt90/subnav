import React, { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { getCancelInfo } from '@/data/cancelUrls';
import { ChevronRight, ChevronLeft, ExternalLink, ChevronDown, ChevronUp, BellOff, RefreshCw } from 'lucide-react';
import { formatCurrency, formatGregorianDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubscriptionDetailScreen({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { t, language, isRTL } = useLanguage();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  
  // Mock data - in a real app this would come from a store or API based on ID
  const subscription = {
    id: params.id || '1',
    name: params.id === '1' ? 'Netflix' : 'Spotify',
    amount: params.id === '1' ? 49 : 21.99,
    renewalDate: new Date(new Date().setDate(new Date().getDate() + (params.id === '1' ? 2 : 5))),
    logoColor: params.id === '1' ? '#E50914' : '#1DB954',
    category: 'streaming',
    merchant: params.id === '1' ? 'Netflix' : 'Spotify',
    emailFrom: params.id === '1' ? 'info@mailer.netflix.com' : 'no-reply@spotify.com',
    emailSubject: params.id === '1' ? 'Your membership details' : 'Your receipt for Spotify Premium',
    emailSnippet: params.id === '1' ? 'We hope you are enjoying your Netflix membership. Your plan details are included below...' : 'Thanks for sticking with Premium. Here is your receipt for...'
  };

  const cancelInfo = getCancelInfo(subscription.merchant);
  const steps = language === 'ar' ? cancelInfo.stepsAr : cancelInfo.stepsEn;
  const duration = language === 'ar' ? cancelInfo.durationAr : cancelInfo.durationEn;
  const note = cancelInfo.note ? (language === 'ar' ? cancelInfo.note.ar : cancelInfo.note.en) : null;
  const cancelLabel = language === 'ar' ? cancelInfo.cancelUrlLabel.ar : cancelInfo.cancelUrlLabel.en;

  const handleCancelClick = () => {
    window.open(cancelInfo.cancelUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0C14] overflow-y-auto no-scrollbar pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-[#0B0C14]/80 backdrop-blur-md z-10 border-b border-[rgba(255,255,255,0.07)]">
        <button 
          onClick={() => setLocation('/dashboard')}
          className="w-9 h-9 bg-[#1C1D2E] border border-[rgba(255,255,255,0.11)] rounded-[10px] flex items-center justify-center text-[#F0F0FA]"
        >
          {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <h1 className="text-base font-semibold text-[#F0F0FA]">{t('subscription_detail')}</h1>
        <button className="w-9 h-9 bg-[#1C1D2E] border border-[rgba(255,255,255,0.11)] rounded-[10px] flex items-center justify-center text-[#F0F0FA]">
          <span className="text-lg mb-2">...</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center pt-2 pb-6 px-5 relative">
        <div className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center text-3xl font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.4)] mb-3 relative" style={{ backgroundColor: subscription.logoColor }}>
          <div className="absolute inset-[-3px] rounded-[23px] border-[1.5px] border-current opacity-40" />
          {subscription.name.charAt(0)}
        </div>
        <h2 className="text-[22px] font-bold text-[#F0F0FA] tracking-tight mb-1">{subscription.name}</h2>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider bg-[rgba(255,255,255,0.1)] text-[#8A8AB8] px-2.5 py-0.5 rounded-full">
            {t(`cat_${subscription.category}` as any)}
          </span>
        </div>
        <div className="absolute bottom-0 left-5 right-5 h-px bg-[rgba(255,255,255,0.07)]" />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-5 pb-0">
        <div className="bg-[#13141F] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7070A0] mb-1.5">{t('amount_unknown').split(' ')[0]}</div>
          <div className="text-lg font-bold text-[#F0F0FA] font-english">{formatCurrency(subscription.amount, language)}</div>
          <div className="text-xs text-[#8A8AB8] mt-1">{t('monthly_suffix')}</div>
        </div>
        <div className="bg-[#13141F] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7070A0] mb-1.5">{t('renewal_date')}</div>
          <div className="text-lg font-bold text-[#F0F0FA] font-english">
             {formatGregorianDate(subscription.renewalDate, language).split(',')[0]}
          </div>
          <div className="text-xs text-[#FA6D8A] mt-1 font-medium">{t('days_left', { days: Math.ceil((subscription.renewalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) })}</div>
        </div>
        
        <div className="col-span-2 bg-[#13141F] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-3.5">
          <div className="flex justify-between items-center mb-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7070A0]">{t('high_confidence')}</div>
            <div className="bg-[rgba(16,185,129,0.2)] text-[#10B981] px-1.5 py-0.5 rounded text-[10px] font-bold">98%</div>
          </div>
          <div className="h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#10B981] w-[98%] rounded-full" />
          </div>
          <p className="text-xs text-[#8A8AB8] mt-2 leading-relaxed">
            {t('confidence_high_desc')}
          </p>
        </div>
      </div>

      {/* Section Divider */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-2.5">
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7070A0]">{t('settings')}</span>
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
      </div>

      {/* Cancel Button */}
      <div className="px-4 mb-1">
        <button 
          onClick={handleCancelClick}
          className="w-full h-[54px] bg-[linear-gradient(135deg,rgba(250,109,138,0.15)_0%,rgba(250,109,138,0.08)_100%)] border-[1.5px] border-[rgba(250,109,138,0.35)] rounded-[16px] flex items-center justify-center gap-2.5 relative overflow-hidden group transition-all hover:border-[rgba(250,109,138,0.6)]"
        >
          <div className="w-8 h-8 bg-[rgba(250,109,138,0.15)] rounded-[9px] flex items-center justify-center flex-shrink-0 text-[#FA6D8A]">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div className="flex flex-col items-start flex-1">
            <span className="text-[15px] font-semibold text-[#FA6D8A] leading-tight">{t('cancel_sub')}</span>
            <span className="text-[11px] text-[#8A8AB8]">{cancelLabel}</span>
          </div>
          <div className="text-[#FA6D8A] opacity-70">
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </button>
      </div>

      {/* How To Cancel Accordion */}
      <div className="px-4 mb-1">
        <div className="bg-[#13141F] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden">
          <div 
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="flex items-center justify-between p-3.5 cursor-pointer gap-2.5 active:bg-[#1C1D2E] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[rgba(91,108,248,0.15)] rounded-[9px] flex items-center justify-center flex-shrink-0 text-[#5B6CF8]">
                <span className="text-sm font-bold">?</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-[#F0F0FA]">
                  {language === 'ar' ? 'كيفية الإلغاء' : 'How to Cancel'}
                </span>
                <span className="text-[11px] text-[#8A8AB8]">{duration}</span>
              </div>
            </div>
            <div className={`text-[#7070A0] transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          <AnimatePresence>
            {isAccordionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-[rgba(255,255,255,0.07)]"
              >
                <div className="p-4 flex flex-col gap-0">
                  {note && (
                    <div className="mb-4 bg-[rgba(250,192,109,0.1)] border border-[rgba(250,192,109,0.2)] rounded-lg p-3 text-xs text-[#FAC06D] leading-relaxed">
                      ⚠️ {note}
                    </div>
                  )}
                  
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 py-2.5 relative group">
                      {idx !== steps.length - 1 && (
                        <div className="absolute right-[15px] top-[34px] w-[2px] h-[calc(100%-14px)] bg-[rgba(255,255,255,0.07)] rounded-[1px]" style={!isRTL ? { left: '15px', right: 'auto' } : {}} />
                      )}
                      <div className="w-[30px] h-[30px] rounded-full bg-[#1C1D2E] border-[1.5px] border-[rgba(255,255,255,0.11)] flex items-center justify-center text-xs font-bold text-[#5B6CF8] flex-shrink-0 relative z-10">
                        {idx + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-[13px] font-semibold text-[#F0F0FA] mb-0.5 leading-snug">
                          {language === 'ar' ? step.titleAr : step.titleEn}
                        </div>
                        {(step.descAr || step.descEn) && (
                          <div className="text-xs text-[#8A8AB8] leading-relaxed">
                            {language === 'ar' ? step.descAr : step.descEn}
                          </div>
                        )}
                        {step.linkUrl && (
                          <a 
                            href={step.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-[#5B6CF8] bg-[rgba(91,108,248,0.1)] border border-[rgba(91,108,248,0.2)] rounded-lg px-2.5 py-1 hover:bg-[rgba(91,108,248,0.2)] transition-colors no-underline"
                          >
                            {language === 'ar' ? step.linkLabelAr : step.linkLabelEn}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Source Email Card */}
      <div className="px-4 mb-1">
        <div className="bg-[#13141F] border border-[rgba(255,255,255,0.07)] rounded-[16px] p-3.5">
          <div className="text-[11px] text-[#7070A0] font-semibold uppercase tracking-wider mb-1.5">{t('source_email')}</div>
          <div className="text-[13px] font-semibold text-[#F0F0FA] mb-1.5 leading-snug">{subscription.emailSubject}</div>
          <div className="text-xs text-[#8A8AB8] leading-relaxed line-clamp-3 overflow-hidden text-ellipsis mb-2.5">
            {subscription.emailSnippet}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8A8AB8] cursor-pointer hover:text-[#F0F0FA] transition-colors">
             <ExternalLink className="w-3 h-3" />
             <span>{language === 'ar' ? 'عرض الإيميل الأصلي' : 'View original email'}</span>
          </div>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-2.5 px-4 pt-1 pb-6">
        <button className="flex-1 h-[46px] bg-[#13141F] border border-[rgba(255,255,255,0.07)] rounded-[13px] flex items-center justify-center gap-1.5 cursor-pointer text-[13px] font-semibold text-[#8A8AB8] hover:bg-[#1C1D2E] hover:text-[#FAC06D] hover:border-[rgba(250,192,109,0.3)] transition-all">
          <BellOff className="w-4 h-4" />
          {t('mute')}
        </button>
        <button className="flex-1 h-[46px] bg-[#13141F] border border-[rgba(255,255,255,0.07)] rounded-[13px] flex items-center justify-center gap-1.5 cursor-pointer text-[13px] font-semibold text-[#8A8AB8] hover:bg-[#1C1D2E] hover:text-[#2DD4BF] hover:border-[rgba(45,212,191,0.3)] transition-all">
          <RefreshCw className="w-4 h-4" />
          {t('refresh')}
        </button>
      </div>

    </div>
  );
}
