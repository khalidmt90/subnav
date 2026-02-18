import { eq, and, asc, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users, subscriptions, notifications, syncStatus,
  type User, type InsertUser,
  type Subscription, type InsertSubscription,
  type Notification, type InsertNotification,
  type SyncStatus, type InsertSyncStatus,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;

  getSubscriptions(userId: number): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: number): Promise<void>;

  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notif: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;

  getSyncStatus(userId: number): Promise<SyncStatus | undefined>;
  upsertSyncStatus(data: InsertSyncStatus): Promise<SyncStatus>;
  updateSyncStatus(userId: number, data: Partial<InsertSyncStatus>): Promise<SyncStatus | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getSubscriptions(userId: number): Promise<Subscription[]> {
    return db.select().from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.isActive, true)))
      .orderBy(asc(subscriptions.renewalDate));
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return sub;
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const [sub] = await db.insert(subscriptions).values(data).returning();
    return sub;
  }

  async updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [sub] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return sub;
  }

  async deleteSubscription(id: number): Promise<void> {
    await db.update(subscriptions).set({ isActive: false }).where(eq(subscriptions.id, id));
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(data).returning();
    return notif;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async getSyncStatus(userId: number): Promise<SyncStatus | undefined> {
    const [status] = await db.select().from(syncStatus).where(eq(syncStatus.userId, userId));
    return status;
  }

  async upsertSyncStatus(data: InsertSyncStatus): Promise<SyncStatus> {
    const existing = await this.getSyncStatus(data.userId);
    if (existing) {
      const [updated] = await db.update(syncStatus)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(syncStatus.userId, data.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(syncStatus).values(data).returning();
      return created;
    }
  }

  async updateSyncStatus(userId: number, data: Partial<InsertSyncStatus>): Promise<SyncStatus | undefined> {
    const [status] = await db.update(syncStatus)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(syncStatus.userId, userId))
      .returning();
    return status;
  }
}

export const storage = new DatabaseStorage();
