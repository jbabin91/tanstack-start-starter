import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { users } from '@/lib/db/schemas/auth';
import { nanoid } from '@/lib/nanoid';

export const posts = pgTable('posts', {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar({ length: 255 }).notNull(),
  body: text().notNull(),
  userId: text().references(() => users.id),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);
export const updatePostSchema = createUpdateSchema(posts);

export type InsertPost = typeof insertPostSchema.infer;
export type Post = typeof selectPostSchema.infer;
export type UpdatePost = typeof updatePostSchema.infer;
