import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { insertSubscriptionSchema } from "@shared/schema";
import { fetchGmailSubscriptions } from "./gmail-service";

const PgSession = connectPgSimple(session);

// Helper to get userId from either session cookie or sessionId in body (for mobile apps)
async function getUserId(req: any): Promise<number | null> {
  let userId = (req.session as any)?.userId;

  if (!userId && req.body?.sessionId) {
    const sessionStore = (req.sessionStore as any);
    await new Promise((resolve, reject) => {
      sessionStore.get(req.body.sessionId, (err: any, session: any) => {
        if (err) reject(err);
        if (session) userId = session.userId;
        resolve(session);
      });
    });
  }

  return userId || null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      store: new PgSession({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "subscriptions-radar-secret-key-dev",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Allow cookies over HTTP in development
        httpOnly: false, // Allow JS access in Capacitor
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "none", // Allow cross-origin cookies for iOS app
      },
    })
  );

  app.post("/api/auth/login", async (req, res) => {
    const startTime = Date.now();
    try {
      console.log('🔐 Login request received:', req.body.email);
      const { email, displayName, avatarUrl, provider } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      console.log('📊 Checking user in database...');
      const dbStartTime = Date.now();
      let user = await storage.getUserByEmail(email);
      console.log(`⏱️ Database query took ${Date.now() - dbStartTime}ms`);

      if (!user) {
        console.log('🆕 New user, creating account...');
        const createStartTime = Date.now();
        user = await storage.createUser({ email, displayName, avatarUrl, provider: provider || "google" });
        console.log(`⏱️ User creation took ${Date.now() - createStartTime}ms`);

        console.log('🌱 Seeding subscriptions...');
        const seedStartTime = Date.now();
        await seedSubscriptions(user.id);
        console.log(`⏱️ Seeding took ${Date.now() - seedStartTime}ms`);
      }

      (req.session as any).userId = user.id;

      // Save session and return sessionId for mobile apps
      console.log('💾 Saving session...');
      const sessionStartTime = Date.now();
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
        }
        console.log(`⏱️ Session save took ${Date.now() - sessionStartTime}ms`);
      });

      console.log(`✅ Login complete in ${Date.now() - startTime}ms`);
      res.json({ ...user, sessionId: req.sessionID });
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  // Support both GET (web) and POST (mobile with sessionId)
  const handleGetMe = async (req: any, res: any) => {
    console.log('🔍 handleGetMe: method=', req.method, 'body=', req.body);
    const userId = await getUserId(req);
    console.log('🔍 handleGetMe: userId=', userId);
    if (!userId) {
      console.log('❌ handleGetMe: No userId, returning 401');
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    console.log('🔍 handleGetMe: user=', user ? user.email : 'null');
    if (!user) {
      console.log('❌ handleGetMe: No user found, returning 401');
      return res.status(401).json({ message: "User not found" });
    }
    console.log('✅ handleGetMe: Returning user:', user.email);
    res.json(user);
  };

  app.get("/api/auth/me", handleGetMe);
  app.post("/api/auth/me", handleGetMe);

  app.patch("/api/auth/me", async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.updateUser(userId, req.body);
    res.json(user);
  });

  // Support both GET (web) and POST (mobile with sessionId) for fetching subscriptions
  const handleGetSubscriptions = async (req: any, res: any) => {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const subs = await storage.getSubscriptions(userId);
    res.json(subs);
  };

  app.get("/api/subscriptions", handleGetSubscriptions);
  app.post("/api/subscriptions/list", handleGetSubscriptions); // Use /list to avoid conflict with create

  app.get("/api/subscriptions/:id", async (req, res) => {
    const sub = await storage.getSubscription(parseInt(req.params.id));
    if (!sub) return res.status(404).json({ message: "Not found" });
    res.json(sub);
  });

  app.post("/api/subscriptions", async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const data = insertSubscriptionSchema.parse({ ...req.body, userId });
      const sub = await storage.createSubscription(data);
      res.status(201).json(sub);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    const sub = await storage.updateSubscription(parseInt(req.params.id), req.body);
    if (!sub) return res.status(404).json({ message: "Not found" });
    res.json(sub);
  });

  app.delete("/api/subscriptions/:id", async (req, res) => {
    await storage.deleteSubscription(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.get("/api/notifications", async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const notifs = await storage.getNotifications(userId);
    res.json(notifs);
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    await storage.markNotificationRead(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    await storage.markAllNotificationsRead(userId);
    res.json({ ok: true });
  });

  // Background sync with progress tracking
  app.post("/api/subscriptions/sync-gmail", async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({ message: "Access token is required" });
      }

      // Initialize sync status
      await storage.upsertSyncStatus({
        userId,
        status: 'syncing',
        progress: 0,
        totalEmails: 0,
        processedEmails: 0,
        foundSubscriptions: 0,
        startedAt: new Date(),
        completedAt: null,
        error: null,
      });

      // Return immediately - sync will run in background
      res.json({
        success: true,
        message: 'Sync started in background. Check /api/sync-status for progress.'
      });

      // Run sync in background
      console.log('🔄 Starting background Gmail sync for user:', userId);

      // Background sync function
      (async () => {
        try {
          // Progress callback
          const progressCallback = async (progress: any) => {
            await storage.updateSyncStatus(userId, {
              status: progress.status,
              progress: progress.progress,
              totalEmails: progress.totalEmails,
              processedEmails: progress.processedEmails,
              foundSubscriptions: progress.foundSubscriptions,
              error: progress.error || null,
              completedAt: progress.status === 'completed' || progress.status === 'error' ? new Date() : null,
            });
          };

          // Fetch subscriptions from Gmail with progress tracking
          const gmailSubs = await fetchGmailSubscriptions(accessToken, progressCallback);
          console.log(`📧 Found ${gmailSubs.length} potential subscriptions in Gmail`);

          // Get existing subscriptions to avoid duplicates
          const existingSubs = await storage.getSubscriptions(userId);
          console.log(`📊 Found ${existingSubs.length} existing subscriptions`);

          // Delete any seed subscriptions to make room for real Gmail data
          const seedMerchants = new Set(['netflix', 'spotify', 'adobe', 'openai', 'amazon']);
          if (gmailSubs.length > 0) {
            console.log('🗑️ Clearing seed subscriptions...');
            for (const sub of existingSubs) {
              if (sub.merchant && seedMerchants.has(sub.merchant.toLowerCase())) {
                await storage.deleteSubscription(sub.id);
                console.log(`🗑️ Deleted seed: ${sub.merchant}`);
              }
            }
          }

          // Refresh existing subs after deletion
          const refreshedSubs = await storage.getSubscriptions(userId);
          const existingMerchants = new Set(
            refreshedSubs
              .map(s => s.merchant?.toLowerCase())
              .filter((m): m is string => m !== null && m !== undefined)
          );

          // Store new subscriptions
          let newCount = 0;
          for (const sub of gmailSubs) {
            if (!existingMerchants.has(sub.merchant.toLowerCase())) {
              try {
                const renewalDate = sub.renewalDate instanceof Date
                  ? sub.renewalDate
                  : new Date(sub.renewalDate);

                if (isNaN(renewalDate.getTime())) {
                  console.error(`❌ Invalid date for ${sub.merchant}, skipping`);
                  continue;
                }

                const subscriptionData = {
                  userId,
                  name: sub.name,
                  merchant: sub.merchant,
                  amount: sub.amount,
                  renewalDate,
                  category: sub.category,
                  logoColor: sub.logoColor,
                  emailFrom: sub.emailFrom,
                  emailSubject: sub.emailSubject,
                  emailSnippet: sub.emailSnippet,
                  confidence: sub.confidence,
                  isTrial: sub.isTrial || false,
                  currency: 'SAR' as const,
                  isMuted: false,
                  isActive: true,
                };

                const validatedData = insertSubscriptionSchema.parse(subscriptionData);
                await storage.createSubscription(validatedData);
                newCount++;
                console.log(`✅ Stored ${sub.merchant} successfully`);
              } catch (error: any) {
                console.error(`❌ Error storing ${sub.merchant}:`, error.message);
              }
            }
          }

          console.log(`✅ Background sync completed: ${newCount} new subscriptions added`);

          // Update final status
          await storage.updateSyncStatus(userId, {
            status: 'completed',
            progress: 100,
            foundSubscriptions: newCount,
            completedAt: new Date(),
          });

        } catch (error: any) {
          console.error('❌ Background sync error:', error);
          await storage.updateSyncStatus(userId, {
            status: 'error',
            error: error.message,
            completedAt: new Date(),
          });
        }
      })();

    } catch (error: any) {
      console.error('❌ Error starting sync:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get sync status (support both GET and POST for native apps)
  app.all("/api/sync-status", async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
      const status = await storage.getSyncStatus(userId);
      if (!status) {
        return res.json({ status: 'idle', progress: 0 });
      }
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}

async function seedSubscriptions(userId: number) {
  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  const subs = [
    {
      userId,
      name: "Netflix",
      amount: 49,
      renewalDate: daysFromNow(2),
      logoColor: "#E50914",
      category: "streaming",
      merchant: "Netflix",
      emailFrom: "info@mailer.netflix.com",
      emailSubject: "Your membership details",
      emailSnippet: "We hope you are enjoying your Netflix membership. Your plan details are included below...",
      confidence: 98,
      currency: 'SAR' as const,
      isTrial: false,
      isMuted: false,
      isActive: true,
    },
    {
      userId,
      name: "Spotify",
      amount: 21.99,
      renewalDate: daysFromNow(5),
      logoColor: "#1DB954",
      category: "streaming",
      merchant: "Spotify",
      emailFrom: "no-reply@spotify.com",
      emailSubject: "Your receipt for Spotify Premium",
      emailSnippet: "Thanks for sticking with Premium. Here is your receipt for...",
      confidence: 95,
      currency: 'SAR' as const,
      isTrial: false,
      isMuted: false,
      isActive: true,
    },
    {
      userId,
      name: "Adobe Creative Cloud",
      amount: 235,
      renewalDate: daysFromNow(12),
      logoColor: "#FF0000",
      category: "software",
      merchant: "Adobe",
      emailFrom: "no-reply@adobe.com",
      emailSubject: "Adobe Creative Cloud Invoice",
      emailSnippet: "Your monthly subscription for Adobe Creative Cloud has been renewed...",
      confidence: 97,
      currency: 'SAR' as const,
      isTrial: false,
      isMuted: false,
      isActive: true,
    },
    {
      userId,
      name: "ChatGPT Plus",
      amount: 89,
      renewalDate: daysFromNow(18),
      logoColor: "#10A37F",
      category: "software",
      merchant: "OpenAI",
      emailFrom: "receipts@openai.com",
      emailSubject: "Your ChatGPT Plus subscription",
      emailSnippet: "Thank you for your ChatGPT Plus subscription. Your next billing date is...",
      confidence: 92,
      currency: 'SAR' as const,
      isTrial: false,
      isMuted: false,
      isActive: true,
    },
    {
      userId,
      name: "Amazon Prime",
      amount: 16,
      renewalDate: daysFromNow(25),
      logoColor: "#00A8E1",
      category: "streaming",
      merchant: "Amazon",
      emailFrom: "auto-confirm@amazon.sa",
      emailSubject: "Amazon Prime Membership",
      emailSnippet: "Your Amazon Prime membership trial is active. You will be charged...",
      isTrial: true,
      confidence: 88,
      currency: 'SAR' as const,
      isMuted: false,
      isActive: true,
    },
  ];

  // Create subscriptions in parallel for faster seeding
  try {
    console.log('📝 Creating seed subscriptions in batch...');
    await Promise.all(subs.map(sub => storage.createSubscription(sub)));
    console.log('✅ All seed subscriptions created');
  } catch (error: any) {
    console.error('❌ Error seeding subscriptions:', error.message);
  }

  // Create notifications in parallel
  try {
    await Promise.all([
      storage.createNotification({
        userId,
        subscriptionId: null,
        title: "Netflix",
        message: "Netflix renewal in 2 days - SAR 49",
        isRead: false,
      }),
      storage.createNotification({
        userId,
        subscriptionId: null,
        title: "Spotify",
        message: "Spotify renews today",
        isRead: true,
      }),
    ]);
  } catch (error: any) {
    console.error('❌ Error seeding notifications:', error.message);
  }
}
