import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { fetchUser } from '@/modules/users/api/get-user';
import { fetchUsers } from '@/modules/users/api/get-users';

export const userQueries = {
  all: () =>
    queryOptions({
      queryKey: ['users'] as const,
      queryFn: () => fetchUsers(),
    }),
  byId: (id: string) =>
    queryOptions({
      queryKey: ['users', id] as const,
      queryFn: () => fetchUser({ data: id }),
    }),
};

// Fetch all users
export function useUsers() {
  return useSuspenseQuery(userQueries.all());
}

// Fetch a user by ID
export function useUser({ id }: { id: string }) {
  return useSuspenseQuery(userQueries.byId(id));
}
