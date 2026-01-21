import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  varchar,
} from 'drizzle-orm/pg-core';
import { categories } from './categories.schema';

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 30 }).notNull(),
  description: text('description'),
  price: integer().notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  categoryId: uuid('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});
