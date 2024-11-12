import { queryOptions, useMutation } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { todo, type TodoCreate, type TodoUpdate } from '@/lib/db/schema';

const getTodos = createServerFn('GET', async () => {
  const todos = await db.query.todo.findMany();
  return todos;
});

const getTodo = createServerFn('GET', async (id: number) => {
  const response = await db.query.todo.findFirst({
    where: eq(todo?.id, id),
  });
  return response;
});

const createTodo = createServerFn('POST', async ({ text }: TodoCreate) => {
  const response = await db.insert(todo).values({ text }).returning();
  return response;
});

const updateTodo = createServerFn(
  'POST',
  async ({ id, text, done }: TodoUpdate) => {
    const response = await db
      .update(todo)
      .set({ done, text })
      .where(eq(todo.id, id!))
      .returning();

    return response;
  },
);

export const todoQueries = {
  byId: (id: number) =>
    queryOptions({
      queryFn: () => getTodo(id),
      queryKey: ['todo', id],
    }),
  list: () =>
    queryOptions({
      queryFn: () => getTodos(),
      queryKey: ['todos'],
    }),
};

export function useCreateTodo() {
  return useMutation({
    mutationFn: (text: string) => createTodo({ text }),
  });
}

export function useUpdateTodo() {
  return useMutation({
    mutationFn: (todo: TodoUpdate) => updateTodo(todo),
  });
}
