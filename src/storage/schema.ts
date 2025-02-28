import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const emails = sqliteTable('emails', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: text('message_id').notNull().unique(),
  threadId: text('thread_id'),
  subject: text('subject'),
  from: text('from').notNull(),
  to: text('to').notNull(),
  receivedAt: integer('received_at', { mode: 'timestamp' }).notNull(),
  labels: text('labels', { mode: 'json' }).$type<string[]>(),
  attachmentsSize: integer('attachments_size').default(0),
  category: text('category'),
  importance: integer('importance').default(0),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  aiAnalysis: text('ai_analysis', { mode: 'json' }).$type<{
    sentiment?: string;
    type?: string;
    summary?: string;
    actionRequired?: boolean;
  }>(),
});

export const emailStats = sqliteTable('email_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sender: text('sender').notNull(),
  emailCount: integer('email_count').default(0),
  lastEmailDate: integer('last_email_date', { mode: 'timestamp' }),
  averageResponseTime: integer('average_response_time'),
  totalAttachmentsSize: integer('total_attachments_size').default(0),
  categories: text('categories', { mode: 'json' }).$type<
    Record<string, number>
  >(),
});

export const userPreferences = sqliteTable('user_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  autoArchiveRules: text('auto_archive_rules', { mode: 'json' }).$type<
    Array<{
      condition: string;
      value: string;
    }>
  >(),
  autoLabelRules: text('auto_label_rules', { mode: 'json' }).$type<
    Array<{
      condition: string;
      value: string;
      label: string;
    }>
  >(),
  defaultImportance: integer('default_importance').default(0),
});

export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;
export type EmailStats = typeof emailStats.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
