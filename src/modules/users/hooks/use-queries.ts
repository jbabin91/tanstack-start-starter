import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { fetchUser } from '@/modules/users/api/get-user';
import { fetchUsers } from '@/modules/users/api/get-users';

export const userQueries = {
  all: () => ['users'] as const,
  lists: () => [...userQueries.all(), 'list'] as const,
  list: () =>
    queryOptions({
      queryKey: [...userQueries.lists()],
      queryFn: () => fetchUsers(),
    }),
  details: () => [...userQueries.all(), 'detail'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.details(), id],
      queryFn: () => fetchUser({ data: id }),
    }),
};

/**
 * Get all users
 * @returns The list of users
 */
export function useUsers() {
  return useSuspenseQuery(userQueries.list());
}

/**
 * Get a user by ID
 * @param param0 - The ID of the user to get
 * @returns The user
 */
export function useUser({ id }: { id: string }) {
  return useSuspenseQuery(userQueries.detail(id));
}
