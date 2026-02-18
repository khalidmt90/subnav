export type CancelStep = {
  titleAr: string;
  titleEn: string;
  descAr?: string;
  descEn?: string;
  linkUrl?: string;       // optional: a direct link shown inside the step
  linkLabelAr?: string;
  linkLabelEn?: string;
};

export type MerchantCancelInfo = {
  cancelUrl: string;          // direct URL to open in browser
  cancelUrlLabel: { ar: string; en: string };
  stepsAr: CancelStep[];      // max 5 steps
  stepsEn: CancelStep[];      // max 5 steps
  durationAr: string;         // e.g. "دقيقتان · ٤ خطوات"
  durationEn: string;
  note?: { ar: string; en: string }; // optional warning note
};

const DEFAULT_STEPS_AR: CancelStep[] = [
  {
    titleAr: 'ابحث في إعدادات التطبيق',
    titleEn: 'Check app settings',
    descAr: 'افتح التطبيق ← الإعدادات ← الاشتراك أو الحساب',
    descEn: 'Open app → Settings → Subscription or Account',
  },
  {
    titleAr: 'أو راجع إعدادات iPhone',
    titleEn: 'Or check iPhone Settings',
    descAr: 'الإعدادات ← اسمك ← الاشتراكات',
    descEn: 'Settings → Your Name → Subscriptions',
  },
  {
    titleAr: 'أو ابحث على Google',
    titleEn: 'Or search Google',
    descAr: 'ابحث عن "كيفية إلغاء اشتراك [اسم الخدمة]"',
    descEn: 'Search "how to cancel [service name] subscription"',
  },
];

const DEFAULT_STEPS_EN: CancelStep[] = [
  {
    titleAr: 'Check app settings',
    titleEn: 'Check app settings',
    descAr: 'Open app → Settings → Subscription or Account',
    descEn: 'Open app → Settings → Subscription or Account',
  },
  {
    titleAr: 'Or check iPhone Settings',
    titleEn: 'Or check iPhone Settings',
    descAr: 'Settings → Your Name → Subscriptions',
    descEn: 'Settings → Your Name → Subscriptions',
  },
  {
    titleAr: 'Or search Google',
    titleEn: 'Or search Google',
    descAr: 'Search "how to cancel [service name] subscription"',
    descEn: 'Search "how to cancel [service name] subscription"',
  },
];

// Key = merchant name lowercase (normalize before lookup)
export const CANCEL_INFO: Record<string, MerchantCancelInfo> = {

  netflix: {
    cancelUrl: 'https://www.netflix.com/cancelplan',
    cancelUrlLabel: { ar: 'صفحة إلغاء Netflix', en: 'Netflix Cancel Page' },
    durationAr: '٤ خطوات · دقيقتان',
    durationEn: '4 steps · 2 minutes',
    note: {
      ar: 'لا يمكن الإلغاء من تطبيق iPhone — استخدم المتصفح',
      en: 'Cannot cancel from iPhone app — use browser',
    },
    stepsAr: [
      {
        titleAr: 'افتح netflix.com',
        titleEn: 'Open netflix.com',
        descAr: 'على المتصفح (Safari أو Chrome) — ليس التطبيق',
        descEn: 'In browser (Safari or Chrome) — not the app',
        linkUrl: 'https://www.netflix.com/cancelplan',
        linkLabelAr: 'افتح صفحة الإلغاء',
        linkLabelEn: 'Open cancel page',
      },
      {
        titleAr: 'اضغط صورة حسابك',
        titleEn: 'Tap your profile picture',
        descAr: 'في الزاوية العلوية اليمنى، ثم اختر "الحساب"',
        descEn: 'Top right corner, then select "Account"',
      },
      {
        titleAr: 'ابحث عن "إلغاء العضوية"',
        titleEn: 'Find "Cancel Membership"',
        descAr: 'في قسم "تفاصيل العضوية والفواتير"',
        descEn: 'Under "Membership & Billing" section',
      },
      {
        titleAr: 'أكّد الإلغاء',
        titleEn: 'Confirm cancellation',
        descAr: 'ستبقى قادراً على المشاهدة حتى نهاية دورة الفوترة الحالية',
        descEn: 'You keep access until end of current billing period',
      },
    ],
    stepsEn: [
       {
        titleAr: 'Open netflix.com',
        titleEn: 'Open netflix.com',
        descAr: 'In browser (Safari or Chrome) — not the app',
        descEn: 'In browser (Safari or Chrome) — not the app',
        linkUrl: 'https://www.netflix.com/cancelplan',
        linkLabelAr: 'Open cancel page',
        linkLabelEn: 'Open cancel page',
      },
      {
        titleAr: 'Tap your profile picture',
        titleEn: 'Tap your profile picture',
        descAr: 'Top right corner, then select "Account"',
        descEn: 'Top right corner, then select "Account"',
      },
      {
        titleAr: 'Find "Cancel Membership"',
        titleEn: 'Find "Cancel Membership"',
        descAr: 'Under "Membership & Billing" section',
        descEn: 'Under "Membership & Billing" section',
      },
      {
        titleAr: 'Confirm cancellation',
        titleEn: 'Confirm cancellation',
        descAr: 'You keep access until end of current billing period',
        descEn: 'You keep access until end of current billing period',
      },
    ]
  },

  spotify: {
    cancelUrl: 'https://www.spotify.com/account/subscription/',
    cancelUrlLabel: { ar: 'إدارة اشتراك Spotify', en: 'Manage Spotify Subscription' },
    durationAr: '٣ خطوات · دقيقة واحدة',
    durationEn: '3 steps · 1 minute',
    stepsAr: [
      {
        titleAr: 'افتح spotify.com/account',
        titleEn: 'Open spotify.com/account',
        descAr: 'سجّل دخولك إذا طُلب منك',
        descEn: 'Log in if prompted',
        linkUrl: 'https://www.spotify.com/account/subscription/',
        linkLabelAr: 'افتح صفحة الاشتراك',
        linkLabelEn: 'Open subscription page',
      },
      {
        titleAr: 'اضغط "تغيير أو إلغاء الخطة"',
        titleEn: 'Tap "Change or cancel plan"',
        descAr: 'ضمن قسم "خطة Spotify"',
        descEn: 'Under the "Spotify plan" section',
      },
      {
        titleAr: 'اختر "إلغاء Premium"',
        titleEn: 'Select "Cancel Premium"',
        descAr: 'اتبع الخطوات وأكّد الإلغاء',
        descEn: 'Follow the steps and confirm',
      },
    ],
    stepsEn: [
      {
        titleAr: 'Open spotify.com/account',
        titleEn: 'Open spotify.com/account',
        descAr: 'Log in if prompted',
        descEn: 'Log in if prompted',
        linkUrl: 'https://www.spotify.com/account/subscription/',
        linkLabelAr: 'Open subscription page',
        linkLabelEn: 'Open subscription page',
      },
      {
        titleAr: 'Tap "Change or cancel plan"',
        titleEn: 'Tap "Change or cancel plan"',
        descAr: 'Under the "Spotify plan" section',
        descEn: 'Under the "Spotify plan" section',
      },
      {
        titleAr: 'Select "Cancel Premium"',
        titleEn: 'Select "Cancel Premium"',
        descAr: 'Follow the steps and confirm',
        descEn: 'Follow the steps and confirm',
      },
    ]
  },

  'apple music': {
    cancelUrl: 'https://appleid.apple.com/account/manage',
    cancelUrlLabel: { ar: 'إعدادات Apple ID', en: 'Apple ID Settings' },
    durationAr: '٤ خطوات · دقيقتان',
    durationEn: '4 steps · 2 minutes',
    note: {
      ar: 'يمكنك الإلغاء مباشرة من إعدادات iPhone',
      en: 'You can cancel directly from iPhone Settings',
    },
    stepsAr: [
      {
        titleAr: 'افتح "الإعدادات" على iPhone',
        titleEn: 'Open "Settings" on iPhone',
        descAr: 'ثم اضغط على اسمك في الأعلى',
        descEn: 'Then tap your name at the top',
      },
      {
        titleAr: 'اضغط "الاشتراكات"',
        titleEn: 'Tap "Subscriptions"',
        descAr: 'ستجد قائمة بجميع اشتراكاتك النشطة',
        descEn: 'You\'ll see all your active subscriptions',
      },
      {
        titleAr: 'اختر "Apple Music"',
        titleEn: 'Select "Apple Music"',
        descAr: 'من قائمة الاشتراكات',
        descEn: 'From the subscriptions list',
      },
      {
        titleAr: 'اضغط "إلغاء الاشتراك"',
        titleEn: 'Tap "Cancel Subscription"',
        descAr: 'أكّد الإلغاء — تبقى النغمات متاحة حتى نهاية الفترة',
        descEn: 'Confirm — music stays available until period ends',
      },
    ],
    stepsEn: [
      {
        titleAr: 'Open "Settings" on iPhone',
        titleEn: 'Open "Settings" on iPhone',
        descAr: 'Then tap your name at the top',
        descEn: 'Then tap your name at the top',
      },
      {
        titleAr: 'Tap "Subscriptions"',
        titleEn: 'Tap "Subscriptions"',
        descAr: 'You\'ll see all your active subscriptions',
        descEn: 'You\'ll see all your active subscriptions',
      },
      {
        titleAr: 'Select "Apple Music"',
        titleEn: 'Select "Apple Music"',
        descAr: 'From the subscriptions list',
        descEn: 'From the subscriptions list',
      },
      {
        titleAr: 'Tap "Cancel Subscription"',
        titleEn: 'Tap "Cancel Subscription"',
        descAr: 'Confirm — music stays available until period ends',
        descEn: 'Confirm — music stays available until period ends',
      },
    ]
  },

  youtube: {
    cancelUrl: 'https://www.youtube.com/paid_memberships',
    cancelUrlLabel: { ar: 'إدارة اشتراك YouTube', en: 'Manage YouTube Subscription' },
    durationAr: '٣ خطوات · دقيقة واحدة',
    durationEn: '3 steps · 1 minute',
    stepsAr: [
      {
        titleAr: 'افتح YouTube وسجّل الدخول',
        titleEn: 'Open YouTube and sign in',
        linkUrl: 'https://www.youtube.com/paid_memberships',
        linkLabelAr: 'افتح صفحة العضوية',
        linkLabelEn: 'Open memberships page',
      },
      {
        titleAr: 'اضغط صورة حسابك ← "المشتريات والعضويات"',
        titleEn: 'Tap profile → "Purchases and memberships"',
        descAr: 'أو اذهب إلى youtube.com/paid_memberships',
        descEn: 'Or go to youtube.com/paid_memberships',
      },
      {
        titleAr: 'اضغط "إلغاء العضوية"',
        titleEn: 'Tap "Cancel membership"',
        descAr: 'بجانب اشتراك YouTube Premium وأكّد',
        descEn: 'Next to YouTube Premium and confirm',
      },
    ],
    stepsEn: [
       {
        titleAr: 'Open YouTube and sign in',
        titleEn: 'Open YouTube and sign in',
        linkUrl: 'https://www.youtube.com/paid_memberships',
        linkLabelAr: 'Open memberships page',
        linkLabelEn: 'Open memberships page',
      },
      {
        titleAr: 'Tap profile → "Purchases and memberships"',
        titleEn: 'Tap profile → "Purchases and memberships"',
        descAr: 'Or go to youtube.com/paid_memberships',
        descEn: 'Or go to youtube.com/paid_memberships',
      },
      {
        titleAr: 'Tap "Cancel membership"',
        titleEn: 'Tap "Cancel membership"',
        descAr: 'Next to YouTube Premium and confirm',
        descEn: 'Next to YouTube Premium and confirm',
      },
    ]
  },

  amazon: {
    cancelUrl: 'https://www.amazon.sa/mc/pipelines/memberships',
    cancelUrlLabel: { ar: 'إدارة اشتراك Amazon', en: 'Manage Amazon Subscription' },
    durationAr: '٤ خطوات · دقيقتان',
    durationEn: '4 steps · 2 minutes',
    stepsAr: [
      {
        titleAr: 'افتح amazon.sa وسجّل الدخول',
        titleEn: 'Open amazon.sa and sign in',
        linkUrl: 'https://www.amazon.sa/mc/pipelines/memberships',
        linkLabelAr: 'افتح إدارة العضوية',
        linkLabelEn: 'Open membership management',
      },
      {
        titleAr: 'اذهب إلى حسابي ← Prime',
        titleEn: 'Go to Account → Prime',
        descAr: 'من القائمة الرئيسية',
        descEn: 'From the main menu',
      },
      {
        titleAr: 'اضغط "إدارة العضوية"',
        titleEn: 'Tap "Manage Membership"',
        descAr: 'ثم "إنهاء عضوية Prime"',
        descEn: 'Then "End Prime Membership"',
      },
      {
        titleAr: 'اختر سبب الإلغاء وأكّد',
        titleEn: 'Select a reason and confirm',
        descAr: 'تبقى المزايا متاحة حتى نهاية الفترة الحالية',
        descEn: 'Benefits remain until end of current period',
      },
    ],
    stepsEn: [
       {
        titleAr: 'Open amazon.sa and sign in',
        titleEn: 'Open amazon.sa and sign in',
        linkUrl: 'https://www.amazon.sa/mc/pipelines/memberships',
        linkLabelAr: 'Open membership management',
        linkLabelEn: 'Open membership management',
      },
      {
        titleAr: 'Go to Account → Prime',
        titleEn: 'Go to Account → Prime',
        descAr: 'From the main menu',
        descEn: 'From the main menu',
      },
      {
        titleAr: 'Tap "Manage Membership"',
        titleEn: 'Tap "Manage Membership"',
        descAr: 'Then "End Prime Membership"',
        descEn: 'Then "End Prime Membership"',
      },
      {
        titleAr: 'Select a reason and confirm',
        titleEn: 'Select a reason and confirm',
        descAr: 'Benefits remain until end of current period',
        descEn: 'Benefits remain until end of current period',
      },
    ]
  },

  stc: {
    cancelUrl: 'https://www.stc.com.sa/wps/portal/stcsa/personal/myservices',
    cancelUrlLabel: { ar: 'خدماتي في STC', en: 'My STC Services' },
    durationAr: '٣ خطوات',
    durationEn: '3 steps',
    stepsAr: [
      {
        titleAr: 'افتح تطبيق MySTC',
        titleEn: 'Open MySTC app',
        descAr: 'أو زُر stc.com.sa وسجّل دخولك',
        descEn: 'Or visit stc.com.sa and log in',
      },
      {
        titleAr: 'اذهب إلى "خدماتي"',
        titleEn: 'Go to "My Services"',
        descAr: 'ستجد قائمة بجميع الاشتراكات النشطة',
        descEn: 'You\'ll see all active subscriptions',
      },
      {
        titleAr: 'ابحث عن الخدمة وألغِها',
        titleEn: 'Find the service and cancel',
        descAr: 'اضغط إلغاء الاشتراك وأكّد عبر رسالة OTP',
        descEn: 'Tap cancel and confirm via OTP message',
      },
    ],
    stepsEn: [
       {
        titleAr: 'Open MySTC app',
        titleEn: 'Open MySTC app',
        descAr: 'Or visit stc.com.sa and log in',
        descEn: 'Or visit stc.com.sa and log in',
      },
      {
        titleAr: 'Go to "My Services"',
        titleEn: 'Go to "My Services"',
        descAr: 'You\'ll see all active subscriptions',
        descEn: 'You\'ll see all active subscriptions',
      },
      {
        titleAr: 'Find the service and cancel',
        titleEn: 'Find the service and cancel',
        descAr: 'Tap cancel and confirm via OTP message',
        descEn: 'Tap cancel and confirm via OTP message',
      },
    ]
  },

  anghami: {
    cancelUrl: 'https://accounts.anghami.com/subscription',
    cancelUrlLabel: { ar: 'إدارة اشتراك Anghami', en: 'Manage Anghami Subscription' },
    durationAr: '٣ خطوات · دقيقة واحدة',
    durationEn: '3 steps · 1 minute',
    stepsAr: [
      {
        titleAr: 'افتح accounts.anghami.com',
        titleEn: 'Open accounts.anghami.com',
        linkUrl: 'https://accounts.anghami.com/subscription',
        linkLabelAr: 'افتح صفحة الاشتراك',
        linkLabelEn: 'Open subscription page',
      },
      {
        titleAr: 'سجّل دخولك وانتقل لـ "اشتراكي"',
        titleEn: 'Log in and go to "My Subscription"',
      },
      {
        titleAr: 'اضغط "إلغاء الاشتراك" وأكّد',
        titleEn: 'Tap "Cancel Subscription" and confirm',
        descAr: 'يمكنك الاستمرار في الاستماع حتى نهاية الفترة',
        descEn: 'You can keep listening until the period ends',
      },
    ],
    stepsEn: [
       {
        titleAr: 'Open accounts.anghami.com',
        titleEn: 'Open accounts.anghami.com',
        linkUrl: 'https://accounts.anghami.com/subscription',
        linkLabelAr: 'Open subscription page',
        linkLabelEn: 'Open subscription page',
      },
      {
        titleAr: 'Log in and go to "My Subscription"',
        titleEn: 'Log in and go to "My Subscription"',
      },
      {
        titleAr: 'Tap "Cancel Subscription" and confirm',
        titleEn: 'Tap "Cancel Subscription" and confirm',
        descAr: 'You can keep listening until the period ends',
        descEn: 'You can keep listening until the period ends',
      },
    ]
  },

  github: {
    cancelUrl: 'https://github.com/settings/billing',
    cancelUrlLabel: { ar: 'إعدادات الفوترة في Github', en: 'Github Billing Settings' },
    durationAr: '٣ خطوات · دقيقة واحدة',
    durationEn: '3 steps · 1 minute',
    stepsAr: [
      {
        titleAr: 'افتح إعدادات الفوترة',
        titleEn: 'Open Billing Settings',
        descAr: 'سجّل الدخول إلى github.com',
        descEn: 'Sign in to github.com',
        linkUrl: 'https://github.com/settings/billing',
        linkLabelAr: 'افتح صفحة الفوترة',
        linkLabelEn: 'Open billing page',
      },
      {
        titleAr: 'اختر الاشتراك المراد إلغاؤه',
        titleEn: 'Select subscription to cancel',
        descAr: 'Copilot أو Pro أو Teams',
        descEn: 'Copilot, Pro, or Teams',
      },
      {
        titleAr: 'اضغط "Cancel" وأكّد',
        titleEn: 'Click "Cancel" and confirm',
        descAr: 'سيبقى نشطاً حتى نهاية الفترة المدفوعة',
        descEn: 'Stays active until end of paid period',
      },
    ],
    stepsEn: [
      {
        titleAr: 'Open Billing Settings',
        titleEn: 'Open Billing Settings',
        descAr: 'Sign in to github.com',
        descEn: 'Sign in to github.com',
        linkUrl: 'https://github.com/settings/billing',
        linkLabelAr: 'Open billing page',
        linkLabelEn: 'Open billing page',
      },
      {
        titleAr: 'Select subscription to cancel',
        titleEn: 'Select subscription to cancel',
        descAr: 'Copilot, Pro, or Teams',
        descEn: 'Copilot, Pro, or Teams',
      },
      {
        titleAr: 'Click "Cancel" and confirm',
        titleEn: 'Click "Cancel" and confirm',
        descAr: 'Stays active until end of paid period',
        descEn: 'Stays active until end of paid period',
      },
    ]
  },

  claude: {
    cancelUrl: 'https://console.anthropic.com/settings/billing',
    cancelUrlLabel: { ar: 'إعدادات الفوترة في Claude', en: 'Claude Billing Settings' },
    durationAr: '٢ خطوة · 30 ثانية',
    durationEn: '2 steps · 30 seconds',
    stepsAr: [
      {
        titleAr: 'افتح إعدادات الفوترة',
        titleEn: 'Open Billing Settings',
        linkUrl: 'https://console.anthropic.com/settings/billing',
        linkLabelAr: 'افتح صفحة الفوترة',
        linkLabelEn: 'Open billing page',
      },
      {
        titleAr: 'اضغط "Cancel Plan"',
        titleEn: 'Click "Cancel Plan"',
        descAr: 'ستجد الزر في قسم الاشتراك',
        descEn: 'You\'ll find the button in subscription section',
      },
    ],
    stepsEn: [
      {
        titleAr: 'Open Billing Settings',
        titleEn: 'Open Billing Settings',
        linkUrl: 'https://console.anthropic.com/settings/billing',
        linkLabelAr: 'Open billing page',
        linkLabelEn: 'Open billing page',
      },
      {
        titleAr: 'Click "Cancel Plan"',
        titleEn: 'Click "Cancel Plan"',
        descAr: 'You\'ll find the button in subscription section',
        descEn: 'You\'ll find the button in subscription section',
      },
    ]
  },

  chatgpt: {
    cancelUrl: 'https://platform.openai.com/settings/organization/billing/overview',
    cancelUrlLabel: { ar: 'إعدادات ChatGPT', en: 'ChatGPT Settings' },
    durationAr: '٣ خطوات · دقيقة واحدة',
    durationEn: '3 steps · 1 minute',
    stepsAr: [
      {
        titleAr: 'افتح إعدادات ChatGPT',
        titleEn: 'Open ChatGPT Settings',
        descAr: 'سجّل الدخول إلى chat.openai.com',
        descEn: 'Sign in to chat.openai.com',
        linkUrl: 'https://platform.openai.com/settings/organization/billing/overview',
        linkLabelAr: 'افتح الإعدادات',
        linkLabelEn: 'Open settings',
      },
      {
        titleAr: 'اذهب إلى "My Plan"',
        titleEn: 'Go to "My Plan"',
        descAr: 'في القائمة الجانبية',
        descEn: 'In the sidebar',
      },
      {
        titleAr: 'اضغط "Cancel Plan"',
        titleEn: 'Click "Cancel Plan"',
        descAr: 'وأكّد الإلغاء',
        descEn: 'And confirm cancellation',
      },
    ],
    stepsEn: [
      {
        titleAr: 'Open ChatGPT Settings',
        titleEn: 'Open ChatGPT Settings',
        descAr: 'Sign in to chat.openai.com',
        descEn: 'Sign in to chat.openai.com',
        linkUrl: 'https://platform.openai.com/settings/organization/billing/overview',
        linkLabelAr: 'Open settings',
        linkLabelEn: 'Open settings',
      },
      {
        titleAr: 'Go to "My Plan"',
        titleEn: 'Go to "My Plan"',
        descAr: 'In the sidebar',
        descEn: 'In the sidebar',
      },
      {
        titleAr: 'Click "Cancel Plan"',
        titleEn: 'Click "Cancel Plan"',
        descAr: 'And confirm cancellation',
        descEn: 'And confirm cancellation',
      },
    ]
  },

  openai: {
    cancelUrl: 'https://platform.openai.com/settings/organization/billing/overview',
    cancelUrlLabel: { ar: 'إعدادات OpenAI', en: 'OpenAI Settings' },
    durationAr: '٣ خطوات · دقيقة واحدة',
    durationEn: '3 steps · 1 minute',
    stepsAr: [
      {
        titleAr: 'افتح إعدادات OpenAI',
        titleEn: 'Open OpenAI Settings',
        linkUrl: 'https://platform.openai.com/settings/organization/billing/overview',
        linkLabelAr: 'افتح الإعدادات',
        linkLabelEn: 'Open settings',
      },
      {
        titleAr: 'اذهب إلى Billing',
        titleEn: 'Go to Billing',
        descAr: 'من القائمة الجانبية',
        descEn: 'From the sidebar',
      },
      {
        titleAr: 'اضغط "Cancel subscription"',
        titleEn: 'Click "Cancel subscription"',
        descAr: 'وأكّد الإلغاء',
        descEn: 'And confirm cancellation',
      },
    ],
    stepsEn: [
      {
        titleAr: 'Open OpenAI Settings',
        titleEn: 'Open OpenAI Settings',
        linkUrl: 'https://platform.openai.com/settings/organization/billing/overview',
        linkLabelAr: 'Open settings',
        linkLabelEn: 'Open settings',
      },
      {
        titleAr: 'Go to Billing',
        titleEn: 'Go to Billing',
        descAr: 'From the sidebar',
        descEn: 'From the sidebar',
      },
      {
        titleAr: 'Click "Cancel subscription"',
        titleEn: 'Click "Cancel subscription"',
        descAr: 'And confirm cancellation',
        descEn: 'And confirm cancellation',
      },
    ]
  },

  // Fallback for unknown merchants
  _default: {
    cancelUrl: '',   // will use service-specific URL fallback
    cancelUrlLabel: { ar: 'صفحة إلغاء الخدمة', en: 'Service cancellation page' },
    durationAr: 'خطوات عامة',
    durationEn: 'General steps',
    stepsAr: DEFAULT_STEPS_AR,
    stepsEn: DEFAULT_STEPS_EN,
  },
};

/**
 * Get cancel info for a merchant.
 * Normalizes the name and falls back to _default.
 */
export function getCancelInfo(merchant: string): MerchantCancelInfo & { isKnown: boolean } {
  const key = merchant.toLowerCase().trim();
  const info = CANCEL_INFO[key] ?? CANCEL_INFO['_default'];
  const isKnown = key in CANCEL_INFO && key !== '_default';

  // For unknown merchants, try to generate a URL to their account/settings page
  if (!isKnown) {
    // Common URL patterns for account/billing pages
    const merchantDomain = key.replace(/\s+/g, '').toLowerCase();
    const possibleUrl = `https://${merchantDomain}.com/account/billing`;

    return {
      ...info,
      cancelUrl: possibleUrl,
      cancelUrlLabel: {
        ar: `صفحة حساب ${merchant}`,
        en: `${merchant} Account Page`
      },
      isKnown: false,
    };
  }
  return { ...info, isKnown: true };
}
