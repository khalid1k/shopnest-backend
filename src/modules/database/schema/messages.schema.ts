import {
  pgTable,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),

  message: text('message').notNull(),

  senderId: uuid('sender_id')
    .references(() => users.id)
    .notNull(),

  createdAt: timestamp('created_at').defaultNow(),
});
