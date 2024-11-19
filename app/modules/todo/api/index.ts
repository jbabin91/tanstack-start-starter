/* eslint-disable sort-keys-fix/sort-keys-fix */
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createServerFn } from '@tanstack/start';
import { zodValidator } from '@tanstack/zod-adapter';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { toast } from '@/components/ui/sonner.tsx';
import { db } from '@/db';
import { todo, todoUpdateSchema } from '@/db/schema';

const getTodos = createServerFn({ method: 'GET' }).handler(async () => {
  const todos = await db.query.todo.findMany({
    orderBy: (todo) => asc(todo.createdAt),
  });
  return todos;
});

const todoIdSchema = z.string();

const getTodoById = createServerFn({ method: 'GET' })
  .validator(zodValidator(todoIdSchema))
  .handler(async ({ data: id }) => {
    const response = await db.query.todo.findFirst({
      where: eq(todo?.id, id),
    });
    return response;
  });

const todoTextSchema = z.string();

const createTodo = createServerFn({ method: 'POST' })
  .validator(zodValidator(todoTextSchema))
  .handler(async ({ data: text }) => {
    const response = await db.insert(todo).values({ text }).returning();
    return response;
  });

const updateTodo = createServerFn({ method: 'POST' })
  .validator(zodValidator(todoUpdateSchema))
  .handler(async ({ data }) => {
    const response = await db
      .update(todo)
      .set({ text: data.text, done: data.done })
      .where(eq(todo.id, data.id!))
      .returning();

    return response;
  });

const deleteTodo = createServerFn({ method: 'POST' })
  .validator(todoIdSchema)
  .handler(async ({ data: id }) => {
    const response = await db.delete(todo).where(eq(todo.id, id)).returning();
    return response;
  });

export const todoQueries = {
  byId: (id: string) =>
    queryOptions({
      queryFn: () => getTodoById({ data: id }),
      queryKey: ['todo', id],
    }),
  list: () =>
    queryOptions({
      queryFn: () => getTodos(),
      queryKey: ['todos'],
    }),
};

export function useTodo() {
  return useQuery({
    ...todoQueries.list(),
    refetchInterval: 60_000, // 1 minute refetch
    refetchIntervalInBackground: true,
  });
}

export function useTodoSuspense() {
  return useSuspenseQuery({
    ...todoQueries.list(),
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
}

export function useTodoById(id: string) {
  return useQuery({
    ...todoQueries.byId(id),
    enabled: Boolean(id),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => createTodo({ data: text }),
    onError: () => {
      toast.error('Todo could not be created');
    },
    onSuccess: () => {
      toast.success('Todo was created');
      queryClient.invalidateQueries({ queryKey: todoQueries.list().queryKey });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: z.infer<typeof todoUpdateSchema>) => updateTodo({ data: todo }),
    onError: () => {
      toast.error('Todo could not be updated');
    },
    onSuccess: (_, data) => {
      toast.success('Todo was updated');
      queryClient.invalidateQueries({ queryKey: todoQueries.list().queryKey });
      if (data.id) {
        queryClient.invalidateQueries({
          queryKey: todoQueries.byId(data.id).queryKey,
        });
      }
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo({ data: id }),
    onError: () => {
      toast.error('Todo could not be deleted');
    },
    onSuccess: () => {
      toast.success('Todo was deleted');
      queryClient.invalidateQueries({ queryKey: todoQueries.list().queryKey });
    },
  });
}
