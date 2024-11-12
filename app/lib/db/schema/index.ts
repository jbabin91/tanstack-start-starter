/* eslint-disable sort-keys-fix/sort-keys-fix */
import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { type z } from 'zod';

export const todo = pgTable('todo', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  text: text('text').notNull(),
  done: boolean('done').default(false).notNull(),
});

export const todoSchema = createSelectSchema(todo);
const todoInsertSchema = createInsertSchema(todo);
export const todoCreateSchema = todoInsertSchema.pick({ text: true });
export const todoUpdateSchema = todoInsertSchema.partial();

export type TodoModel = z.infer<typeof todoSchema>;
export type TodoCreate = z.infer<typeof todoCreateSchema>;
export type TodoUpdate = z.infer<typeof todoUpdateSchema>;
