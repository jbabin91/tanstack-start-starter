import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from '@/lib/db/schemas/auth';
import { posts } from '@/lib/db/schemas/posts';
import { nanoid } from '@/lib/nanoid';

export const comments = pgTable(
  'comments',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    body: text().notNull(),
    postId: text()
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // For threaded comments support
    parentId: text().references((): any => comments.id, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date()),
  },
  (table) => [
    // Performance indexes for common queries
    index('comments_post_id_idx').on(table.postId),
    index('comments_user_id_idx').on(table.userId),
    index('comments_parent_id_idx').on(table.parentId),
    index('comments_created_at_idx').on(table.createdAt),
    index('comments_post_created_at_idx').on(table.postId, table.createdAt),
  ],
);

// Relations for type-safe joins
export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'parentComment',
  }),
  replies: many(comments, {
    relationName: 'parentComment',
  }),
}));

export const insertCommentSchema = createInsertSchema(comments);
export const selectCommentSchema = createSelectSchema(comments);
export const updateCommentSchema = createUpdateSchema(comments);

export type InsertComment = typeof insertCommentSchema.infer;
export type Comment = typeof selectCommentSchema.infer;
export type UpdateComment = typeof updateCommentSchema.infer;
