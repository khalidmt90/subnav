import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { insertSubscriptionSchema } from "@shared/schema";

const PgSession = connectPgSimple(session);

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
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, displayName, avatarUrl, provider } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email, displayName, avatarUrl, provider: provider || "google" });
        await seedSubscriptions(user.id);
      }

      (req.session as any).userId = user.id;
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json(user);
  });

  app.patch("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.updateUser(userId, req.body);
    res.json(user);
  });

  app.get("/api/subscriptions", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const subs = await storage.getSubscriptions(userId);
    res.json(subs);
  });

  app.get("/api/subscriptions/:id", async (req, res) => {
    const sub = await storage.getSubscription(parseInt(req.params.id));
    if (!sub) return res.status(404).json({ message: "Not found" });
    res.json(sub);
  });

  app.post("/api/subscriptions", async (req, res) => {
    const userId = (req.session as any)?.userId;
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
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const notifs = await storage.getNotifications(userId);
    res.json(notifs);
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    await storage.markNotificationRead(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    await storage.markAllNotificationsRead(userId);
    res.json({ ok: true });
  });

  return httpServer;
}

async function seedSubscriptions(userId: number) {
  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  const subs = [
    { userId, name: "Netflix", amount: 49, renewalDate: daysFromNow(2), logoColor: "#E50914", category: "streaming", merchant: "Netflix", emailFrom: "info@mailer.netflix.com", emailSubject: "Your membership details", emailSnippet: "We hope you are enjoying your Netflix membership. Your plan details are included below...", confidence: 98 },
    { userId, name: "Spotify", amount: 21.99, renewalDate: daysFromNow(5), logoColor: "#1DB954", category: "streaming", merchant: "Spotify", emailFrom: "no-reply@spotify.com", emailSubject: "Your receipt for Spotify Premium", emailSnippet: "Thanks for sticking with Premium. Here is your receipt for...", confidence: 95 },
    { userId, name: "Adobe Creative Cloud", amount: 235, renewalDate: daysFromNow(12), logoColor: "#FF0000", category: "software", merchant: "Adobe", emailFrom: "no-reply@adobe.com", emailSubject: "Adobe Creative Cloud Invoice", emailSnippet: "Your monthly subscription for Adobe Creative Cloud has been renewed...", confidence: 97 },
    { userId, name: "ChatGPT Plus", amount: 89, renewalDate: daysFromNow(18), logoColor: "#10A37F", category: "software", merchant: "OpenAI", emailFrom: "receipts@openai.com", emailSubject: "Your ChatGPT Plus subscription", emailSnippet: "Thank you for your ChatGPT Plus subscription. Your next billing date is...", confidence: 92 },
    { userId, name: "Amazon Prime", amount: 16, renewalDate: daysFromNow(25), logoColor: "#00A8E1", category: "streaming", merchant: "Amazon", emailFrom: "auto-confirm@amazon.sa", emailSubject: "Amazon Prime Membership", emailSnippet: "Your Amazon Prime membership trial is active. You will be charged...", isTrial: true, confidence: 88 },
  ];

  for (const sub of subs) {
    await storage.createSubscription(sub as any);
  }

  await storage.createNotification({
    userId,
    subscriptionId: null,
    title: "Netflix",
    message: "Netflix renewal in 2 days - SAR 49",
    isRead: false,
  });
  await storage.createNotification({
    userId,
    subscriptionId: null,
    title: "Spotify",
    message: "Spotify renews today",
    isRead: true,
  });
}
