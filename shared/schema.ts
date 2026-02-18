import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  provider: text("provider").notNull().default("google"),
  language: text("language").notNull().default("ar"),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  notifyDaysBefore: integer("notify_days_before").notNull().default(3),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("SAR"),
  renewalDate: timestamp("renewal_date").notNull(),
  category: text("category").notNull().default("other"),
  logoColor: text("logo_color").notNull().default("#5B6CF8"),
  isTrial: boolean("is_trial").notNull().default(false),
  isMuted: boolean("is_muted").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  merchant: text("merchant"),
  emailFrom: text("email_from"),
  emailSubject: text("email_subject"),
  emailSnippet: text("email_snippet"),
  confidence: integer("confidence").notNull().default(90),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subscriptionId: integer("subscription_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const syncStatus = pgTable("sync_status", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  status: text("status").notNull().default("idle"), // idle, syncing, completed, error
  progress: integer("progress").notNull().default(0), // 0-100
  totalEmails: integer("total_emails").notNull().default(0),
  processedEmails: integer("processed_emails").notNull().default(0),
  foundSubscriptions: integer("found_subscriptions").notNull().default(0),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// Custom schema for subscriptions with proper date handling
const baseSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = baseSubscriptionSchema.extend({
  renewalDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val)),
    z.number().transform((val) => new Date(val)),
  ]).pipe(z.date()),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertSyncStatusSchema = createInsertSchema(syncStatus).omit({ id: true, updatedAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type SyncStatus = typeof syncStatus.$inferSelect;
export type InsertSyncStatus = z.infer<typeof insertSyncStatusSchema>;
