import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 30 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
