import { useSuspenseQuery } from '@tanstack/react-query';

import { userQueries } from '@/modules/users/api';

// Fetch all users
export function useUsers() {
  return useSuspenseQuery(userQueries.all());
}

// Fetch a user by ID
export function useUser(id: string) {
  return useSuspenseQuery(userQueries.byId(id));
}
