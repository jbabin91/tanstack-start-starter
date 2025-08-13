import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-arktype';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { organizations, users } from '@/lib/db/schemas/auth';
import { nanoid } from '@/lib/nanoid';

export const media = pgTable(
  'media',
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    filename: varchar({ length: 255 }).notNull(),
    originalName: varchar({ length: 255 }).notNull(),
    mimeType: varchar({ length: 100 }).notNull(),
    size: integer().notNull(), // File size in bytes
    url: text().notNull(), // Cloudflare R2 URL
    key: text().notNull(), // R2 object key
    bucket: varchar({ length: 100 }).notNull(), // R2 bucket name
    // Ownership and organization
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: text().references(() => organizations.id, {
      onDelete: 'cascade',
    }),
    // Metadata
    alt: text(), // Alt text for accessibility
    caption: text(), // Optional caption
    metadata: text(), // JSON metadata (dimensions, duration, etc.)
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Performance indexes for common queries
    index('media_user_id_idx').on(table.userId),
    index('media_organization_id_idx').on(table.organizationId),
    index('media_created_at_idx').on(table.createdAt),
    index('media_mime_type_idx').on(table.mimeType),
    index('media_user_created_at_idx').on(table.userId, table.createdAt),
  ],
);

// Relations for type-safe joins
export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, {
    fields: [media.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [media.organizationId],
    references: [organizations.id],
  }),
}));

export const insertMediaSchema = createInsertSchema(media);
export const selectMediaSchema = createSelectSchema(media);
export const updateMediaSchema = createUpdateSchema(media);

export type InsertMedia = typeof insertMediaSchema.infer;
export type Media = typeof selectMediaSchema.infer;
export type UpdateMedia = typeof updateMediaSchema.infer;
