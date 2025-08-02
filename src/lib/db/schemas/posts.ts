import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/lib/db/schemas/auth';
import { nanoid } from '@/lib/nanoid';

export const posts = pgTable(
  'posts',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: varchar({ length: 255 }).notNull(),
    body: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Performance indexes for common queries
    index('posts_user_id_idx').on(table.userId),
    index('posts_created_at_idx').on(table.createdAt),
    index('posts_user_created_at_idx').on(table.userId, table.createdAt),
  ],
);

// Relations for type-safe joins
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);
export const updatePostSchema = createUpdateSchema(posts);

export type InsertPost = typeof insertPostSchema.infer;
export type Post = typeof selectPostSchema.infer;
export type UpdatePost = typeof updatePostSchema.infer;
