import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { organizations, users } from '@/lib/db/schemas/auth';
import { nanoid } from '@/lib/nanoid';

export const posts = pgTable(
  'posts',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: varchar({ length: 255 }).notNull(),
    body: text().notNull(),
    status: varchar({ length: 20 }).notNull().default('draft'), // draft, published
    slug: varchar({ length: 255 }), // URL-friendly slug
    excerpt: text(), // Short description
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: text().references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Performance indexes for common queries
    index('posts_user_id_idx').on(table.userId),
    index('posts_organization_id_idx').on(table.organizationId),
    index('posts_status_idx').on(table.status),
    index('posts_slug_idx').on(table.slug),
    index('posts_created_at_idx').on(table.createdAt),
    index('posts_published_at_idx').on(table.publishedAt),
    index('posts_user_created_at_idx').on(table.userId, table.createdAt),
    index('posts_status_published_at_idx').on(table.status, table.publishedAt),
  ],
);

// Relations for type-safe joins
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [posts.organizationId],
    references: [organizations.id],
  }),
}));

export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);
export const updatePostSchema = createUpdateSchema(posts);

export type InsertPost = typeof insertPostSchema.infer;
export type Post = typeof selectPostSchema.infer;
export type UpdatePost = typeof updatePostSchema.infer;
