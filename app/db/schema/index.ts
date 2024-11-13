/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createId } from '@paralleldrive/cuid2';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { type z } from 'zod';

export const todo = pgTable('todo', {
  id: text().primaryKey().$defaultFn(createId),
  text: text().notNull(),
  done: boolean().default(false).notNull(),
  createdAt: timestamp({ mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp({ mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
});

export const todoSchema = createSelectSchema(todo);
const todoInsertSchema = createInsertSchema(todo);
export const todoCreateSchema = todoInsertSchema.pick({ text: true });
export const todoUpdateSchema = todoInsertSchema.partial();

export type TodoModel = z.infer<typeof todoSchema>;
export type TodoCreate = z.infer<typeof todoCreateSchema>;
export type TodoUpdate = z.infer<typeof todoUpdateSchema>;
