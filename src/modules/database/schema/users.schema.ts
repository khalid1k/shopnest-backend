import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar("fullName", { length: 255}).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar("password").notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});


