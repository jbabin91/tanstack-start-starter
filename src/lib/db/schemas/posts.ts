import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from '@/lib/db/schemas/users';

export const postsTable = pgTable('posts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  body: text().notNull(),
  userId: integer().references(() => usersTable.id),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Auto-generated ArkType schemas from Drizzle table
export const insertPostSchema = createInsertSchema(postsTable);
export const selectPostSchema = createSelectSchema(postsTable);
export const updatePostSchema = createUpdateSchema(postsTable);

export type InsertPost = typeof insertPostSchema.infer;
export type Post = typeof selectPostSchema.infer;
export type UpdatePost = typeof updatePostSchema.infer;
