import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const urls = pgTable('urls', {
  id: serial('id').primaryKey(),
  originalUrl: text('original_url').notNull(),
  slug: varchar('slug', { length: 10 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: text('user_id'),
  visits: serial('visits').default(0),
});

export type Url = typeof urls.$inferSelect;
export type NewUrl = typeof urls.$inferInsert; 