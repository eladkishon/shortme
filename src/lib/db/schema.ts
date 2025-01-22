import { pgTable, serial, text, timestamp, varchar, integer, boolean } from 'drizzle-orm/pg-core';

export const urls = pgTable('urls', {
  id: serial('id').primaryKey(),
  originalUrl: text('original_url').notNull(),
  slug: varchar('slug', { length: 10 }).notNull().unique(),
  userId: text('user_id'),
  visits: integer('visits').notNull().default(0),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true).notNull(),
});

export type Url = typeof urls.$inferSelect;
export type NewUrl = typeof urls.$inferInsert;

export const urlVisits = pgTable('url_visits', {
  id: serial('id').primaryKey(),
  urlId: integer('url_id').references(() => urls.id).notNull(),
  visitorHash: text('visitor_hash'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  visitedAt: timestamp('visited_at').defaultNow().notNull(),
});

export type UrlVisit = typeof urlVisits.$inferSelect;
export type NewUrlVisit = typeof urlVisits.$inferInsert;