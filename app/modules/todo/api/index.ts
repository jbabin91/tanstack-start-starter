import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { createServerFn } from '@tanstack/start';
import { asc, eq } from 'drizzle-orm';

import { toast } from '@/components/ui/sonner';
import { db } from '@/lib/db';
import { todo, type TodoCreate, type TodoUpdate } from '@/lib/db/schema';

const getTodos = createServerFn('GET', async () => {
  const todos = await db.query.todo.findMany({
    orderBy: (todo) => asc(todo.createdAt),
  });
  return todos;
});

const getTodo = createServerFn('GET', async (id: string) => {
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

const deleteTodo = createServerFn('POST', async (id: string) => {
  const response = await db.delete(todo).where(eq(todo.id, id)).returning();
  return response;
});

export const todoQueries = {
  byId: (id: string) =>
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

export function useTodo() {
  return useQuery({
    ...todoQueries.list(),
    refetchInterval: 60_000, // 1 minute refetch
    refetchIntervalInBackground: true,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => createTodo({ text }),
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
    mutationFn: (todo: TodoUpdate) => updateTodo(todo),
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
    mutationFn: (id: string) => deleteTodo(id),
    onError: () => {
      toast.error('Todo could not be deleted');
    },
    onSuccess: () => {
      toast.success('Todo was deleted');
      queryClient.invalidateQueries({ queryKey: todoQueries.list().queryKey });
    },
  });
}
