import { google } from 'googleapis';

interface ParsedSubscription {
  name: string;
  merchant: string;
  amount: number;
  renewalDate: Date;
  category: string;
  logoColor: string;
  emailFrom: string;
  emailSubject: string;
  emailSnippet: string;
  confidence: number;
  isTrial?: boolean;
}

const SUBSCRIPTION_KEYWORDS = [
  'subscription', 'renewal', 'recurring', 'monthly charge',
  'billing', 'invoice', 'receipt', 'payment', 'membership',
  'your plan', 'premium', 'pro plan', 'annual plan',
  'notification', 'charged', 'auto-renew', 'subscription renewal',
  'payment confirmation', 'billing statement', 'your receipt',
  'monthly subscription', 'annual subscription', 'plan renewal',
  'payment received', 'payment processed', 'thank you for your payment',
  'successfully charged', 'transaction', 'order confirmation',
  // Arabic keywords
  'اشتراك', 'تجديد', 'فاتورة', 'دفع', 'عضوية', 'إشعار',
  'تم الدفع', 'إيصال', 'سداد', 'تأكيد الدفع', 'رسوم', 'مبلغ',
  'تجديد تلقائي', 'باقة', 'خطة', 'اشتراكك', 'تجديد الاشتراك',
  'تذكير', 'موعد التجديد', 'تم خصم', 'تم تحصيل', 'حسابك',
];

// Exclude promotional/newsletter patterns to reduce noise
const EXCLUSION_PATTERNS = [
  'newsletter', 'daily digest', 'weekly update', 'monthly roundup',
  'promotional', 'limited time offer', 'flash sale', 'clearance',
  'upgrade for free', 'claim your discount', 'save up to',
  'ends tomorrow', 'last chance', 'exclusive offer', 'special offer',
  'usage alert', 'usage notification', 'usage summary', 'spent on usage',
  'manage your subscription preferences',
  'تخفيضات', 'عرض خاص', 'عرض محدود'
];

const MERCHANT_PATTERNS: Record<string, { color: string; category: string; aliases?: string[] }> = {
  // Streaming Services
  netflix: { color: '#E50914', category: 'streaming' },
  spotify: { color: '#1DB954', category: 'streaming' },
  'apple music': { color: '#FA243C', category: 'streaming', aliases: ['applemusic'] },
  'youtube premium': { color: '#FF0000', category: 'streaming', aliases: ['youtube', 'yt premium'] },
  'youtube music': { color: '#FF0000', category: 'streaming', aliases: ['youtubemusic'] },
  disney: { color: '#113CCF', category: 'streaming', aliases: ['disney+', 'disneyplus'] },
  hulu: { color: '#1CE783', category: 'streaming' },
  'amazon prime': { color: '#00A8E1', category: 'streaming', aliases: ['prime video', 'primevideo'] },
  'apple tv': { color: '#000000', category: 'streaming', aliases: ['appletv', 'apple tv+'] },
  hbo: { color: '#000000', category: 'streaming', aliases: ['hbo max', 'hbomax'] },
  peacock: { color: '#000000', category: 'streaming' },
  paramount: { color: '#0064FF', category: 'streaming', aliases: ['paramount+'] },

  // AI & Software
  'chatgpt': { color: '#10A37F', category: 'software', aliases: ['chatgpt plus', 'gpt', 'gpt-4'] },
  openai: { color: '#10A37F', category: 'software' },
  claude: { color: '#D97757', category: 'software', aliases: ['anthropic', 'claude pro'] },
  anthropic: { color: '#D97757', category: 'software' },
  midjourney: { color: '#000000', category: 'software' },

  // Social Media
  'x premium': { color: '#000000', category: 'software', aliases: ['twitter blue', 'twitter premium'] },
  twitter: { color: '#1DA1F2', category: 'software', aliases: ['twitter blue'] },
  linkedin: { color: '#0A66C2', category: 'software', aliases: ['linkedin premium'] },

  // Cloud & Storage
  dropbox: { color: '#0061FF', category: 'cloud' },
  'google one': { color: '#4285F4', category: 'cloud', aliases: ['googleone'] },
  icloud: { color: '#3693F3', category: 'cloud', aliases: ['icloud+'] },
  onedrive: { color: '#0078D4', category: 'cloud' },

  // Productivity
  adobe: { color: '#FF0000', category: 'software', aliases: ['creative cloud', 'adobe cc'] },
  microsoft: { color: '#00A4EF', category: 'software', aliases: ['microsoft 365', 'm365'] },
  'office 365': { color: '#D83B01', category: 'software', aliases: ['office365'] },
  notion: { color: '#000000', category: 'software' },
  canva: { color: '#00C4CC', category: 'software', aliases: ['canva pro'] },
  figma: { color: '#F24E1E', category: 'software' },

  // Development
  github: { color: '#24292e', category: 'software', aliases: ['github pro', 'github copilot'] },
  gitlab: { color: '#FC6D26', category: 'software' },
  vercel: { color: '#000000', category: 'software' },
  netlify: { color: '#00C7B7', category: 'software' },
  replit: { color: '#F26207', category: 'software', aliases: ['repl.it'] },
  grammarly: { color: '#15C39A', category: 'software', aliases: ['grammarly pro', 'grammarly premium'] },

  // News & Media
  audible: { color: '#FF9900', category: 'streaming' },
  kindle: { color: '#FF9900', category: 'streaming', aliases: ['kindle unlimited'] },
  'new york times': { color: '#000000', category: 'streaming', aliases: ['nyt', 'nytimes'] },
  medium: { color: '#000000', category: 'streaming' },
  substack: { color: '#FF6719', category: 'streaming' },

  // Gaming
  playstation: { color: '#003791', category: 'streaming', aliases: ['ps plus', 'playstation plus'] },
  xbox: { color: '#107C10', category: 'streaming', aliases: ['xbox live', 'game pass', 'xbox game pass'] },
  steam: { color: '#171A21', category: 'streaming' },
  nintendo: { color: '#E60012', category: 'streaming', aliases: ['nintendo online', 'switch online'] },

  // VPN & Security
  nordvpn: { color: '#4687FF', category: 'software', aliases: ['nord vpn'] },
  expressvpn: { color: '#DA3940', category: 'software', aliases: ['express vpn'] },
  '1password': { color: '#0094F5', category: 'software' },
  lastpass: { color: '#D32D27', category: 'software' },
  dashlane: { color: '#0E3E51', category: 'software' },

  // Fitness & Health
  'apple fitness': { color: '#FA243C', category: 'streaming', aliases: ['fitness+', 'apple fitness+'] },
  peloton: { color: '#000000', category: 'streaming' },
  headspace: { color: '#F47D31', category: 'streaming' },
  calm: { color: '#2DCDDF', category: 'streaming' },
  strava: { color: '#FC4C02', category: 'streaming' },

  // Web Hosting & Domains
  namecheap: { color: '#FF6C2C', category: 'cloud' },
  godaddy: { color: '#1BDBDB', category: 'cloud' },
  bluehost: { color: '#3D5AFE', category: 'cloud' },
  squarespace: { color: '#000000', category: 'cloud' },
  wix: { color: '#0C6EFC', category: 'cloud' },
  wordpress: { color: '#21759B', category: 'cloud', aliases: ['wordpress.com'] },

  // Email & Communication
  mailchimp: { color: '#FFE01B', category: 'software' },
  sendgrid: { color: '#1A82E2', category: 'software' },
  zoom: { color: '#2D8CFF', category: 'software' },
  slack: { color: '#4A154B', category: 'software' },

  // Design & Creative
  shutterstock: { color: '#EE2B24', category: 'software' },
  skillshare: { color: '#00C1B2', category: 'streaming' },
  masterclass: { color: '#000000', category: 'streaming' },

  // Payment & Finance
  paypal: { color: '#003087', category: 'finance' },
  stripe: { color: '#635BFF', category: 'finance' },
  quickbooks: { color: '#2CA01C', category: 'finance' },

  // Telecom
  verizon: { color: '#CD040B', category: 'telecom' },
  'at&t': { color: '#00A8E0', category: 'telecom', aliases: ['att', 'at&t'] },
  tmobile: { color: '#E20074', category: 'telecom', aliases: ['t-mobile'] },
  vodafone: { color: '#E60000', category: 'telecom' },
  stc: { color: '#6F2C91', category: 'telecom', aliases: ['saudi telecom', 'سطع'] },
  mobily: { color: '#76BC21', category: 'telecom', aliases: ['موبايلي'] },
  zain: { color: '#6E2C91', category: 'telecom', aliases: ['زين'] },
  'virgin mobile': { color: '#E10A0A', category: 'telecom', aliases: ['virgin'] },

  // Middle Eastern Streaming
  shahid: { color: '#D50F25', category: 'streaming', aliases: ['shahid vip', 'شاهد'] },
  osn: { color: '#000000', category: 'streaming', aliases: ['osn+', 'osn streaming'] },
  starzplay: { color: '#000000', category: 'streaming', aliases: ['starz play'] },

  // Social Media Premium
  snapchat: { color: '#FFFC00', category: 'software', aliases: ['snapchat+', 'snap+'] },
  telegram: { color: '#0088CC', category: 'software', aliases: ['telegram premium'] },
  discord: { color: '#5865F2', category: 'software', aliases: ['discord nitro', 'nitro'] },
  instagram: { color: '#E4405F', category: 'software', aliases: ['instagram+', 'meta verified'] },

  // Food Delivery (popular in Saudi)
  careem: { color: '#00B140', category: 'food', aliases: ['careem plus'] },
  uber: { color: '#000000', category: 'food', aliases: ['uber one', 'uber eats'] },
  deliveroo: { color: '#00CCBC', category: 'food', aliases: ['deliveroo plus'] },
  talabat: { color: '#FF5A00', category: 'food', aliases: ['talabat pro', 'طلبات'] },
  jahez: { color: '#FF6B00', category: 'food', aliases: ['jahez plus', 'جاهز'] },
  hungerstation: { color: '#FF2D55', category: 'food', aliases: ['hunger station', 'هنقرستيشن'] },

  // More Gaming
  'epic games': { color: '#313131', category: 'streaming', aliases: ['epic', 'epicgames'] },
  'ea play': { color: '#FF1E3C', category: 'streaming', aliases: ['eaplay', 'ea access'] },
  ubisoft: { color: '#0080FF', category: 'streaming', aliases: ['ubisoft+', 'uplay'] },

  // Saudi/ME specific services
  karzoun: { color: '#FF6B35', category: 'other', aliases: ['كرزون'] },
  noon: { color: '#FEEE00', category: 'other', aliases: ['نون', 'noon vip'] },
  tamara: { color: '#2B2E4A', category: 'finance', aliases: ['تمارا'] },
  tabby: { color: '#3DFFC0', category: 'finance', aliases: ['تابي'] },
  stc_pay: { color: '#6F2C91', category: 'finance', aliases: ['stc pay', 'stcpay'] },
  mada: { color: '#004B87', category: 'finance', aliases: ['مدى'] },
  tawakkalna: { color: '#2E8B57', category: 'software', aliases: ['توكلنا'] },
  absher: { color: '#006633', category: 'software', aliases: ['أبشر'] },
  nana: { color: '#6CBD45', category: 'food', aliases: ['نعناع', 'nana direct'] },
  to_you: { color: '#FF3366', category: 'food', aliases: ['toyou', 'to you', 'تو يو'] },
  mrsool: { color: '#FFCC00', category: 'food', aliases: ['مرسول'] },
  anghami: { color: '#1E003B', category: 'streaming', aliases: ['أنغامي'] },
  webook: { color: '#E91E63', category: 'streaming', aliases: ['ويبوك'] },
  salla: { color: '#004BFF', category: 'software', aliases: ['سلة'] },
  zid: { color: '#5B2AEF', category: 'software', aliases: ['زد'] },
  rewaa: { color: '#4CAF50', category: 'software', aliases: ['رواء'] },
  moyasar: { color: '#1A237E', category: 'finance', aliases: ['ميسر'] },
  foodics: { color: '#FF6600', category: 'software', aliases: ['فودكس'] },
};

// Top subscription services to search for directly (including Saudi/ME popular services)
const TOP_SERVICES = [
  // Streaming
  'Netflix', 'Spotify', 'Amazon Prime', 'Apple', 'YouTube Premium', 'Disney',
  'Hulu', 'HBO', 'Peacock', 'Paramount', 'Shahid', 'OSN', 'StarzPlay',

  // AI & Creative
  'ChatGPT', 'Claude', 'OpenAI', 'Anthropic', 'Midjourney', 'Canva',
  'Adobe', 'Figma', 'Notion',

  // Cloud & Productivity
  'Microsoft', 'GitHub', 'Dropbox', 'Google One', 'iCloud',
  'Slack', 'Zoom', 'Office 365',

  // Social Media
  'LinkedIn', 'Twitter', 'Snapchat', 'Telegram', 'Discord', 'Instagram',

  // Gaming
  'PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'EA Play',

  // VPN & Security
  'NordVPN', 'ExpressVPN', '1Password', 'LastPass',

  // Telecom (Saudi)
  'STC', 'Mobily', 'Zain', 'Virgin Mobile',

  // Other
  'Audible', 'Kindle', 'Peloton', 'Headspace', 'Calm',
  'Careem', 'Uber', 'Deliveroo', 'Talabat', 'Jahez', 'HungerStation',
];

// Progress callback for async syncing
export type SyncProgressCallback = (progress: {
  status: 'syncing' | 'completed' | 'error';
  totalEmails: number;
  processedEmails: number;
  foundSubscriptions: number;
  progress: number;
  error?: string;
}) => Promise<void>;

export async function fetchGmailSubscriptions(
  accessToken: string,
  progressCallback?: SyncProgressCallback
): Promise<ParsedSubscription[]> {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Calculate date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const afterDate = threeMonthsAgo.toISOString().split('T')[0].replace(/-/g, '/');

    // Build comprehensive search: generic terms + specific service names + date range
    const genericQueries = [
      '(subscription OR renewal OR recurring OR "monthly charge")',
      '(invoice OR receipt OR billing OR payment)',
      '(notification OR charged OR "auto-renew")',
      '(membership OR premium OR "pro plan" OR "annual plan")',
      '(from:noreply OR from:billing OR from:receipts OR from:support OR from:payments)',
      '("payment confirmation" OR "payment received" OR "successfully charged" OR "transaction")',
      // Arabic search terms
      '(اشتراك OR تجديد OR فاتورة OR إيصال OR سداد OR "تم الدفع" OR "تأكيد الدفع" OR تذكير OR "تم خصم" OR رسوم)',
    ];

    // Add top service names to search
    const serviceQuery = '(' + TOP_SERVICES.map(s => `"${s}"`).join(' OR ') + ')';

    const fullQuery = `(${[...genericQueries, serviceQuery].join(' OR ')}) after:${afterDate}`;

    console.log(`📧 Gmail search query includes ${TOP_SERVICES.length} popular services, from last 3 months (after ${afterDate})`);

    // Fetch ALL message IDs using pagination
    const allMessageIds: string[] = [];
    let pageToken: string | undefined;
    let pageCount = 0;

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: fullQuery,
        maxResults: 500, // Max per page
        pageToken,
      });

      if (response.data.messages) {
        allMessageIds.push(...response.data.messages.map(m => m.id!));
        console.log(`📧 Page ${++pageCount}: Found ${response.data.messages.length} emails (total: ${allMessageIds.length})`);
      }

      pageToken = response.data.nextPageToken as string | undefined;

      // Report progress
      if (progressCallback) {
        await progressCallback({
          status: 'syncing',
          totalEmails: allMessageIds.length,
          processedEmails: 0,
          foundSubscriptions: 0,
          progress: Math.min(20, (pageCount / 10) * 20), // First 20% is fetching IDs
        });
      }

      // Safety limit: max 10 pages (5000 emails)
      if (pageCount >= 10) {
        console.log(`⚠️ Reached page limit (${pageCount} pages, ${allMessageIds.length} emails)`);
        break;
      }
    } while (pageToken);

    if (allMessageIds.length === 0) {
      console.log('📧 No messages found matching query');
      if (progressCallback) {
        await progressCallback({
          status: 'completed',
          totalEmails: 0,
          processedEmails: 0,
          foundSubscriptions: 0,
          progress: 100,
        });
      }
      return [];
    }

    console.log(`📧 Total emails to scan: ${allMessageIds.length}`);

    const subscriptions: ParsedSubscription[] = [];
    const seen = new Set<string>(); // Track unique merchants

    // Process emails in batches to avoid timeout
    const BATCH_SIZE = 50;
    let processedCount = 0;

    for (let i = 0; i < allMessageIds.length; i += BATCH_SIZE) {
      const batch = allMessageIds.slice(i, Math.min(i + BATCH_SIZE, allMessageIds.length));
      console.log(`📧 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allMessageIds.length / BATCH_SIZE)} (${batch.length} emails)...`);

      // Process batch in parallel with controlled concurrency
      const batchPromises = batch.map(async (messageId) => {
        try {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full',
          });

          return parseEmailForSubscription(msg.data);
        } catch (error) {
          console.error(`Error fetching message ${messageId}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);

      // Add unique subscriptions from this batch
      for (const parsed of batchResults) {
        if (parsed) {
          const merchantKey = parsed.merchant.toLowerCase();
          if (!seen.has(merchantKey)) {
            subscriptions.push(parsed);
            seen.add(merchantKey);
            console.log(`✅ Found subscription: ${parsed.merchant} - $${parsed.amount}`);
          }
        }
      }

      processedCount += batch.length;

      // Report progress
      if (progressCallback) {
        const progress = 20 + Math.floor((processedCount / allMessageIds.length) * 80); // 20-100%
        await progressCallback({
          status: 'syncing',
          totalEmails: allMessageIds.length,
          processedEmails: processedCount,
          foundSubscriptions: subscriptions.length,
          progress,
        });
      }
    }

    console.log(`📧 Extracted ${subscriptions.length} unique subscriptions from ${allMessageIds.length} emails`);

    if (progressCallback) {
      await progressCallback({
        status: 'completed',
        totalEmails: allMessageIds.length,
        processedEmails: processedCount,
        foundSubscriptions: subscriptions.length,
        progress: 100,
      });
    }

    return subscriptions;
  } catch (error) {
    console.error('Error fetching Gmail:', error);
    if (progressCallback) {
      await progressCallback({
        status: 'error',
        totalEmails: 0,
        processedEmails: 0,
        foundSubscriptions: 0,
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    throw error;
  }
}

// Patterns that strongly indicate a recurring subscription
const RECURRING_INDICATORS = [
  'recurring', 'auto-renew', 'automatically renew', 'subscription',
  'monthly', 'annually', 'yearly', 'per month', 'per year',
  'next billing', 'billing cycle', 'renewal date',
  'will be charged', 'will renew', 'continues', 'ongoing',
  'charged your', 'payment processed', 'paid successfully',
  'receipt for your', 'invoice for your', 'your payment of',
  // Arabic
  'تجديد تلقائي', 'شهري', 'سنوي', 'اشتراك', 'تجديد الاشتراك',
  'تم خصم', 'تم تحصيل', 'تم الدفع', 'سداد', 'رسوم شهرية',
  'موعد التجديد', 'تذكير بالتجديد', 'اشتراكك',
];

function parseEmailForSubscription(message: any): ParsedSubscription | null {
  try {
    const headers = message.payload?.headers || [];
    const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
    const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';
    const snippet = message.snippet || '';

    // Extract email body
    let body = '';
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload?.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    const fullText = `${subject} ${snippet} ${body}`.toLowerCase();

    // Filter out promotional/newsletter emails first
    const isExcluded = EXCLUSION_PATTERNS.some(pattern =>
      fullText.includes(pattern.toLowerCase())
    );

    if (isExcluded) {
      console.log(`⏭️ Skipped (excluded pattern): ${subject.substring(0, 50)}`);
      return null; // Skip newsletters and promotional emails
    }

    // Filter out newsletter/digest senders
    const newsletterDomains = ['substack.com', 'beehiiv.com', 'mailchimp.com', 'sendgrid.net', 'convertkit.com'];
    const isNewsletter = newsletterDomains.some(domain => from.toLowerCase().includes(domain));
    if (isNewsletter) {
      console.log(`⏭️ Skipped (newsletter domain): ${subject.substring(0, 50)}`);
      return null;
    }

    // Check if it's subscription-related OR has recurring payment indicators
    const hasSubscriptionKeyword = SUBSCRIPTION_KEYWORDS.some(kw =>
      fullText.includes(kw.toLowerCase())
    );

    const hasRecurringIndicator = RECURRING_INDICATORS.some(ind =>
      fullText.includes(ind.toLowerCase())
    );

    // Must have either subscription keywords or recurring indicators
    if (!hasSubscriptionKeyword && !hasRecurringIndicator) {
      console.log(`⏭️ Skipped (no subscription keywords): ${subject.substring(0, 50)}`);
      return null;
    }

    // Extract merchant name
    const merchant = extractMerchantName(from, subject, fullText);
    if (!merchant) {
      console.log(`⏭️ Skipped (no merchant found): ${subject.substring(0, 50)} | From: ${from.substring(0, 40)}`);
      return null;
    }

    // Extract amount (optional — some emails don't include amounts)
    const amount = extractAmount(fullText) || 0;

    // Extract renewal date
    const renewalDate = extractRenewalDate(fullText);

    // Ensure we have a valid Date object
    const finalRenewalDate = renewalDate && renewalDate instanceof Date && !isNaN(renewalDate.getTime())
      ? renewalDate
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now

    // Validate the final date
    if (!(finalRenewalDate instanceof Date) || isNaN(finalRenewalDate.getTime())) {
      console.error('❌ Invalid renewal date created for', merchant);
      return null;
    }

    // Get merchant config or use defaults
    const merchantConfig = MERCHANT_PATTERNS[merchant.toLowerCase()] || {
      color: '#5B6CF8',
      category: 'other',
    };

    // Check if it's a trial
    const isTrial = fullText.includes('trial') || fullText.includes('free') || fullText.includes('تجربة');

    // Calculate confidence based on factors
    let confidence = 50; // Start lower for unknown services
    if (amount > 0) confidence += 15;
    if (renewalDate) confidence += 10;
    if (merchant) confidence += 5;
    if (hasRecurringIndicator) confidence += 15; // Boost for recurring indicators
    if (MERCHANT_PATTERNS[merchant.toLowerCase()]) confidence += 10; // Boost for known merchants

    return {
      name: merchant,
      merchant,
      amount,
      renewalDate: finalRenewalDate,
      category: merchantConfig.category,
      logoColor: merchantConfig.color,
      emailFrom: from,
      emailSubject: subject,
      emailSnippet: snippet.substring(0, 200),
      confidence: Math.min(confidence, 100),
      isTrial,
    };
  } catch (error) {
    console.error('Error parsing email:', error);
    return null;
  }
}

function extractMerchantName(from: string, subject: string, text: string): string | null {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();
  const textLower = text.toLowerCase();

  // Check known merchants and their aliases first
  // Prioritize matches from email address (most reliable)
  for (const [merchant, config] of Object.entries(MERCHANT_PATTERNS)) {
    const merchantLower = merchant.toLowerCase();

    // Skip very short merchant names to avoid false positives (unless in from address)
    if (merchantLower.length < 3 && !fromLower.includes(merchantLower)) {
      continue;
    }

    // Check email from address first (most reliable)
    if (fromLower.includes(merchantLower)) {
      return merchant.charAt(0).toUpperCase() + merchant.slice(1);
    }

    // Check aliases in from address
    if (config.aliases) {
      for (const alias of config.aliases) {
        const aliasLower = alias.toLowerCase();
        if (aliasLower.length >= 3 && fromLower.includes(aliasLower)) {
          return merchant.charAt(0).toUpperCase() + merchant.slice(1);
        }
      }
    }
  }

  // Second pass: check subject line for known merchants (less reliable)
  for (const [merchant, config] of Object.entries(MERCHANT_PATTERNS)) {
    const merchantLower = merchant.toLowerCase();

    if (merchantLower.length >= 3 && subjectLower.includes(merchantLower)) {
      return merchant.charAt(0).toUpperCase() + merchant.slice(1);
    }

    if (config.aliases) {
      for (const alias of config.aliases) {
        const aliasLower = alias.toLowerCase();
        if (aliasLower.length >= 3 && subjectLower.includes(aliasLower)) {
          return merchant.charAt(0).toUpperCase() + merchant.slice(1);
        }
      }
    }
  }

  // Extract from subject line if it's a clear payment/receipt pattern
  const receiptPatterns = [
    /^\[([A-Za-z][A-Za-z0-9]+(?:\s+[A-Za-z][A-Za-z0-9]+){0,2})\]\s+(?:payment|receipt|invoice|billing|subscription)/i,
    /^([A-Za-z][A-Za-z0-9]+(?:\s+[A-Za-z][A-Za-z0-9]+){0,2})\s+(?:payment receipt|receipt for|invoice for|subscription|billing)/i,
    /(?:payment receipt for|receipt from|invoice from|subscription to)\s+([A-Za-z][A-Za-z0-9]+(?:\s+[A-Za-z][A-Za-z0-9]+){0,2})/i,
    /(?:your|the)\s+([A-Za-z][A-Za-z0-9]+(?:\s+[A-Za-z][A-Za-z0-9]+){0,2})\s+(?:subscription|membership|plan|receipt|invoice|payment)/i,
    // Arabic patterns
    /(?:اشتراك|تجديد|فاتورة|إيصال)\s+(.{2,30}?)(?:\s+[-–|]|\s*$)/,
    /(.{2,30}?)\s+(?:اشتراك|تجديد|فاتورة|إيصال)/,
  ];

  for (const pattern of receiptPatterns) {
    const match = subject.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      const genericWords = [
        'payment', 'receipt', 'invoice', 'billing', 'notification', 'your', 'the', 'this', 'that',
        'new', 'free', 'trial', 'update', 'confirm', 'confirmation', 'reminder', 'alert',
        'welcome', 'thank', 'thanks', 'dear', 'hi', 'hello',
      ];
      if (name.length >= 2 && !genericWords.includes(name.toLowerCase())) {
        return name;
      }
    }
  }

  // Fallback: extract sender display name from "From" header
  // e.g., "KARZOUN <noreply@karzoun.com>" → "KARZOUN"
  // e.g., "Billing Team <billing@example.com>" → extract domain name
  const senderName = extractSenderName(from);
  if (senderName) {
    return senderName;
  }

  return null;
}

function extractSenderName(from: string): string | null {
  // Generic sender names to skip
  const genericSenders = [
    'noreply', 'no-reply', 'billing', 'support', 'info', 'admin', 'help',
    'team', 'service', 'notification', 'notifications', 'alert', 'alerts',
    'mail', 'email', 'donotreply', 'do-not-reply', 'mailer', 'postmaster',
    'billing team', 'support team', 'customer service', 'customer support',
  ];

  // Try to get display name: "Display Name <email@domain.com>"
  const displayNameMatch = from.match(/^"?([^"<]+?)"?\s*</);
  if (displayNameMatch) {
    const displayName = displayNameMatch[1].trim();
    if (displayName.length >= 2 && !genericSenders.includes(displayName.toLowerCase())) {
      // Capitalize properly
      return displayName.split(/\s+/).map(w =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ');
    }
  }

  // Fallback: extract from domain name
  // "noreply@karzoun.com" → "Karzoun"
  const emailMatch = from.match(/@([a-zA-Z0-9-]+)\./);
  if (emailMatch) {
    const domain = emailMatch[1].toLowerCase();
    const genericDomains = [
      'gmail', 'yahoo', 'hotmail', 'outlook', 'mail', 'email',
      'googlemail', 'icloud', 'protonmail', 'aol', 'live',
    ];
    if (!genericDomains.includes(domain) && domain.length >= 3) {
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  }

  return null;
}

function extractAmount(text: string): number | null {
  // Match currency patterns: $XX.XX, SAR XX, XX.XX SAR, €XX, etc.
  const patterns = [
    // Saudi Riyal
    /(?:sar|sr|﷼)\s*(\d+(?:[.,]\d{2})?)/i,
    /(\d+(?:[.,]\d{2})?)\s*(?:sar|sr|﷼|riyal)/i,
    // US Dollar
    /\$\s*(\d+(?:[.,]\d{2})?)/,
    /(\d+(?:[.,]\d{2})?)\s*(?:usd|dollars?)/i,
    // Euro
    /€\s*(\d+(?:[.,]\d{2})?)/,
    /(\d+(?:[.,]\d{2})?)\s*(?:eur|euros?)/i,
    // British Pound
    /£\s*(\d+(?:[.,]\d{2})?)/,
    /(\d+(?:[.,]\d{2})?)\s*(?:gbp|pounds?)/i,
    // Generic amount patterns with context
    /(?:total|amount|price|charge|charged|subscription):\s*[\$€£﷼]?\s*(\d+(?:[.,]\d{2})?)/i,
    /(?:pay|paid|paying|billed)\s*[\$€£﷼]?\s*(\d+(?:[.,]\d{2})?)/i,
    /(?:you were charged|you paid|payment of)\s*[\$€£﷼]?\s*(\d+(?:[.,]\d{2})?)/i,
    // Recurring patterns
    /(\d+(?:[.,]\d{2})?)\s*(?:per month|\/month|monthly|per year|\/year|annually)/i,
    // Invoice/receipt patterns
    /(?:invoice|receipt|bill).*?[\$€£﷼]\s*(\d+(?:[.,]\d{2})?)/i,
    /[\$€£﷼]\s*(\d+(?:[.,]\d{2})?)\s*(?:will be|has been|was)\s*(?:charged|billed)/i,
    // Arabic amount patterns
    /(?:مبلغ|قيمة|رسوم|خصم|تحصيل)\s*:?\s*(\d+(?:[.,]\d{2})?)\s*(?:ريال|ر\.س|SAR)?/i,
    /(\d+(?:[.,]\d{2})?)\s*(?:ريال|ر\.س)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Handle both comma and period as decimal separator
      const amount = parseFloat(match[1].replace(',', '.'));
      if (amount > 0 && amount < 10000) { // Reasonable subscription range
        return amount;
      }
    }
  }

  return null;
}

function extractRenewalDate(text: string): Date | null {
  // Look for date patterns (various formats)
  const datePatterns = [
    // With context keywords
    /(?:renew|renewal|next billing|due|expires?|next charge).*?(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}).*?(?:renew|renewal|billing|due|expires?)/i,
    /(?:on|date|until):\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    // ISO format: YYYY-MM-DD
    /(?:renew|renewal|next billing|due|expires?|next charge).*?(\d{4}-\d{2}-\d{2})/i,
    // Month name formats (e.g., "January 15, 2024", "15 Jan 2024")
    /(?:renew|renewal|next billing|due|expires?|next charge).*?(\w+\s+\d{1,2},?\s+\d{4})/i,
    /(\w+\s+\d{1,2},?\s+\d{4}).*?(?:renew|renewal|billing|due|expires?)/i,
    /(\d{1,2}\s+\w+\s+\d{4}).*?(?:renew|renewal|billing|due|expires?)/i,
    // "Your next payment is on..." patterns
    /(?:next payment|next charge|will (?:be )?charged?).*?(?:on|is)\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /(?:next payment|next charge|will (?:be )?charged?).*?(?:on|is)\s*(\w+\s+\d{1,2},?\s+\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const date = new Date(match[1]);
        // Validate: must be a valid date object, not NaN
        if (date instanceof Date && !isNaN(date.getTime())) {
          // Allow dates up to 1 year in the past (for already-renewed subscriptions)
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

          // And up to 2 years in the future (for annual subscriptions)
          const twoYearsFromNow = new Date();
          twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

          if (date > oneYearAgo && date < twoYearsFromNow) {
            return date;
          }
        }
      } catch (error) {
        console.error('Error parsing date:', match[1], error);
        continue;
      }
    }
  }

  return null;
}
