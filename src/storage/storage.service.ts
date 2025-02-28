import { Injectable } from '@nestjs/common';
import { db } from './database.provider';
import { emails, emailStats, userPreferences } from './schema';
import type { Email, EmailStats, NewEmail, UserPreferences } from './schema';
import { eq, and, SQL } from 'drizzle-orm';

@Injectable()
export class StorageService {
  async saveEmail(
    email: Partial<NewEmail> & { messageId: string },
  ): Promise<Email> {
    const existing = await db
      .select()
      .from(emails)
      .where(eq(emails.messageId, email.messageId));

    if (existing.length > 0) {
      const [updated] = await db
        .update(emails)
        .set(email)
        .where(eq(emails.messageId, email.messageId))
        .returning();
      return updated;
    } else {
      if (!email.from || !email.to || !email.receivedAt) {
        throw new Error('Missing required fields for new email');
      }
      const [inserted] = await db
        .insert(emails)
        .values(email as NewEmail)
        .returning();
      return inserted;
    }
  }

  async updateEmailStats(
    stats: Partial<EmailStats> & { sender: string },
  ): Promise<void> {
    const existing = await db
      .select()
      .from(emailStats)
      .where(eq(emailStats.sender, stats.sender));

    if (existing.length > 0) {
      await db
        .update(emailStats)
        .set(stats)
        .where(eq(emailStats.sender, stats.sender));
    } else {
      await db.insert(emailStats).values(stats);
    }
  }

  async getSenderStats(sender: string): Promise<EmailStats | null> {
    const [stats] = await db
      .select()
      .from(emailStats)
      .where(eq(emailStats.sender, sender));
    return stats || null;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs || null;
  }

  async updateUserPreferences(
    userId: string,
    prefs: Partial<UserPreferences>,
  ): Promise<void> {
    const existing = await this.getUserPreferences(userId);

    if (existing) {
      await db
        .update(userPreferences)
        .set(prefs)
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({ userId, ...prefs });
    }
  }

  async getEmails(filters: {
    sender?: string;
    category?: string;
    isArchived?: boolean;
    isDeleted?: boolean;
  }): Promise<Email[]> {
    let conditions: SQL<unknown>[] = [];

    if (filters.sender) {
      conditions.push(eq(emails.from, filters.sender));
    }
    if (filters.category) {
      conditions.push(eq(emails.category, filters.category));
    }
    if (filters.isArchived !== undefined) {
      conditions.push(eq(emails.isArchived, filters.isArchived));
    }
    if (filters.isDeleted !== undefined) {
      conditions.push(eq(emails.isDeleted, filters.isDeleted));
    }

    return await db
      .select()
      .from(emails)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  }
}
