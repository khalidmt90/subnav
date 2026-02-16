import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
};

const translations = {
  ar: {
    app_name: 'رادار الاشتراكات',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgot_password: 'نسيت كلمة المرور؟',
    get_started: 'ابدأ الآن',
    skip: 'تخطي',
    next: 'التالي',
    connect_gmail: 'ربط Gmail',
    disconnect_gmail: 'قطع الاتصال',
    gmail_connected: 'Gmail متصل',
    gmail_disconnected: 'Gmail غير مفعّل — اضغط لإعادة الربط',
    reconnect_gmail: 'إعادة ربط Gmail',
    dashboard: 'الرئيسية',
    renewing_this_week: 'تجدد هذا الأسبوع',
    trials_ending: 'تجارب تنتهي قريباً',
    next_30_days: 'خلال 30 يوم',
    show_all: 'عرض الكل',
    monthly_total: 'الإجمالي الشهري',
    monthly_suffix: '/شهر',
    active_subscriptions: 'اشتراكات نشطة',
    mute: 'كتم',
    muted_badge: 'مكتوم',
    cancel_sub: 'إلغاء الاشتراك',
    refresh: 'تحديث',
    edit_amount: 'تعديل المبلغ',
    save: 'حفظ',
    settings: 'الإعدادات',
    account: 'الحساب',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    theme: 'المظهر',
    theme_dark: 'داكن',
    theme_light: 'فاتح',
    theme_auto: 'تلقائي',
    notifications: 'الإشعارات',
    enable_notifications: 'تفعيل الإشعارات',
    notify_before: 'التنبيه قبل التجديد',
    one_day: 'يوم واحد',
    three_days: '3 أيام',
    one_week: 'أسبوع',
    privacy_section: 'الخصوصية',
    privacy_policy: 'سياسة الخصوصية',
    delete_account: 'حذف الحساب والبيانات',
    delete_confirm: 'هل أنت متأكد؟ سيتم حذف جميع بياناتك نهائياً ولا يمكن التراجع.',
    delete_confirm_btn: 'نعم، احذف حسابي',
    cancel: 'إلغاء',
    logout: 'تسجيل الخروج',
    syncing: 'جاري فحص بريدك الإلكتروني...',
    sync_complete: 'اكتمل الفحص',
    scanning_last_90: 'تحليل آخر 90 يوماً',
    emails_scanned: '{count} إيميل تم فحصه',
    found_subscriptions: 'تم العثور على {count} اشتراك',
    no_subscriptions: 'لا توجد اشتراكات حتى الآن',
    no_renewals_week: 'لا تجديدات هذا الأسبوع ✓',
    no_trials: 'لا تجارب نشطة',
    amount_unknown: 'مبلغ غير محدد',
    amount_display: '{amount} ريال',
    per_month: '/شهر',
    days_left: 'بعد {days} أيام',
    days_left_1: 'غداً',
    days_left_0: 'اليوم',
    renews_today: 'يجدد اليوم',
    renews_tomorrow: 'يجدد غداً',
    high_confidence: 'ثقة عالية',
    medium_confidence: 'ثقة متوسطة',
    low_confidence: 'ثقة منخفضة',
    confidence_high_desc: 'رصدنا هذا الاشتراك بثقة عالية من بريدك الإلكتروني',
    confidence_mid_desc: 'رصدنا هذا الاشتراك لكن تأكد من بريدك الإلكتروني',
    subscription_detail: 'تفاصيل الاشتراك',
    source_email: 'مصدر الإيميل',
    category: 'الفئة',
    renewal_date: 'تاريخ التجديد',
    hijri_date: 'التاريخ الهجري',
    trial_badge: 'تجربة مجانية',
    coming_soon: 'قريباً',
    permission_title: 'لماذا نحتاج صلاحية Gmail؟',
    permission_body: 'سنقرأ إيميلاتك للبحث عن الاشتراكات فقط. لن نخزن محتوى إيميلاتك — نخزن فقط معلومات الاشتراك المستخرجة مثل اسم الخدمة وتاريخ التجديد.',
    permission_access_1: 'قراءة الإيميلات للبحث عن الاشتراكات',
    permission_access_2: 'صلاحية القراءة فقط (لا إرسال، لا حذف)',
    permission_denied: 'يحتاج التطبيق صلاحية القراءة للعمل بشكل صحيح.',
    skip_for_now: 'تخطي الآن',
    retry: 'حاول مجدداً',
    error_generic: 'حدث خطأ، يرجى المحاولة مجدداً',
    error_invalid_email: 'البريد الإلكتروني غير صحيح',
    error_weak_password: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    error_wrong_credentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    error_passwords_match: 'كلمتا المرور غير متطابقتين',
    reset_sent: 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني',
    action_success: 'تم بنجاح',
    onboard_1_title: 'رادار الاشتراكات',
    onboard_1_body: 'نكتشف اشتراكاتك تلقائياً من بريدك الإلكتروني دون أي جهد منك',
    onboard_2_title: 'تنبيهات قبل التجديد',
    onboard_2_body: 'نُذكّرك قبل أي تجديد حتى لا تُفاجأ برسوم غير متوقعة',
    onboard_3_title: 'تحكم كامل',
    onboard_3_body: 'ألغِ أو أخفِ ما تريد — أنت من يقرر',
    cat_streaming: 'بث مباشر',
    cat_software: 'برمجيات',
    cat_food: 'طعام',
    cat_finance: 'مالية',
    cat_telecom: 'اتصالات',
    cat_cloud: 'سحابية',
    cat_other: 'أخرى',
    notification_title: 'تجديد اشتراك {merchant}',
    notification_body_amount: '{title} يجدد {when} - {amount} ريال',
    notification_body_no_amount: '{title} يجدد {when}',
  },
  en: {
    app_name: 'Subscriptions Radar',
    login: 'Log In',
    signup: 'Create Account',
    email: 'Email Address',
    password: 'Password',
    forgot_password: 'Forgot Password?',
    get_started: 'Get Started',
    skip: 'Skip',
    next: 'Next',
    connect_gmail: 'Connect Gmail',
    disconnect_gmail: 'Disconnect Gmail',
    gmail_connected: 'Gmail Connected',
    gmail_disconnected: 'Gmail disconnected — tap to reconnect',
    reconnect_gmail: 'Reconnect Gmail',
    dashboard: 'Dashboard',
    renewing_this_week: 'Renewing This Week',
    trials_ending: 'Trials Ending',
    next_30_days: 'Next 30 Days',
    show_all: 'Show All',
    monthly_total: 'Monthly Total',
    monthly_suffix: '/month',
    active_subscriptions: 'active subscriptions',
    mute: 'Mute',
    muted_badge: 'Muted',
    cancel_sub: 'Mark Canceled',
    refresh: 'Refresh',
    edit_amount: 'Edit Amount',
    save: 'Save',
    settings: 'Settings',
    account: 'Account',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    theme: 'Theme',
    theme_dark: 'Dark',
    theme_light: 'Light',
    theme_auto: 'Auto',
    notifications: 'Notifications',
    enable_notifications: 'Enable Notifications',
    notify_before: 'Notify me before renewal',
    one_day: '1 Day',
    three_days: '3 Days',
    one_week: '1 Week',
    privacy_section: 'Privacy',
    privacy_policy: 'Privacy Policy',
    delete_account: 'Delete Account & Data',
    delete_confirm: 'Are you sure? This will permanently delete all your data and cannot be undone.',
    delete_confirm_btn: 'Yes, Delete Account',
    cancel: 'Cancel',
    logout: 'Log Out',
    syncing: 'Scanning your emails...',
    sync_complete: 'Scan Complete',
    scanning_last_90: 'Analyzing last 90 days',
    emails_scanned: '{count} emails scanned',
    found_subscriptions: 'Found {count} subscriptions',
    no_subscriptions: 'No subscriptions found yet',
    no_renewals_week: 'No renewals this week ✓',
    no_trials: 'No active trials',
    amount_unknown: 'Unknown amount',
    amount_display: 'SAR {amount}',
    per_month: '/mo',
    days_left: 'in {days} days',
    days_left_1: 'Tomorrow',
    days_left_0: 'Today',
    renews_today: 'Renews Today',
    renews_tomorrow: 'Renews Tomorrow',
    high_confidence: 'High Confidence',
    medium_confidence: 'Medium Confidence',
    low_confidence: 'Low Confidence',
    confidence_high_desc: 'Detected with high confidence from your email',
    confidence_mid_desc: 'Detected, but please verify',
    subscription_detail: 'Subscription Details',
    source_email: 'Source Email',
    category: 'Category',
    renewal_date: 'Renewal Date',
    hijri_date: 'Hijri Date',
    trial_badge: 'Free Trial',
    coming_soon: 'Coming Soon',
    permission_title: 'Why do we need Gmail access?',
    permission_body: 'We scan your emails to find subscriptions only. We never store your email content — only the extracted subscription info like service name and renewal date.',
    permission_access_1: 'Read emails to find subscriptions',
    permission_access_2: 'Read-only access (no sending, no deleting)',
    permission_denied: 'App needs read permission to work correctly.',
    skip_for_now: 'Skip for now',
    retry: 'Retry',
    error_generic: 'Something went wrong, please try again',
    error_invalid_email: 'Invalid email address',
    error_weak_password: 'Password must be at least 6 characters',
    error_wrong_credentials: 'Invalid email or password',
    error_passwords_match: 'Passwords do not match',
    reset_sent: 'Reset link sent to your email',
    action_success: 'Success',
    onboard_1_title: 'Subscriptions Radar',
    onboard_1_body: 'Automatically detect subscriptions from your emails without manual entry',
    onboard_2_title: 'Renewal Alerts',
    onboard_2_body: 'Get reminded before any renewal so you are never surprised by unexpected charges',
    onboard_3_title: 'Full Control',
    onboard_3_body: 'Cancel or mute what you don\'t need — you are in control',
    cat_streaming: 'Streaming',
    cat_software: 'Software',
    cat_food: 'Food',
    cat_finance: 'Finance',
    cat_telecom: 'Telecom',
    cat_cloud: 'Cloud',
    cat_other: 'Other',
    notification_title: 'Renewal: {merchant}',
    notification_body_amount: '{title} renews {when} - {amount}',
    notification_body_no_amount: '{title} renews {when}',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    // Default to RTL on mount
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let text = (translations[language] as any)[key] || key;
    
    if (vars) {
      Object.keys(vars).forEach(v => {
        text = text.replace(`{${v}}`, String(vars[v]));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isRTL: language === 'ar',
      dir: language === 'ar' ? 'rtl' : 'ltr'
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
