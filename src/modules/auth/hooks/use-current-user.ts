import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { getUser } from '@/modules/auth/api/get-user';

/**
 * Query options for authentication-related data
 */
export const authQueries = {
  /**
   * Get all auth-related queries (for invalidation)
   */
  all: () => ({ queryKey: ['auth'] as const }),
  /**
   * Get current authenticated user with permissions and organization context
   * Permissions are computed automatically by better-auth user callback
   */
  currentUser: () =>
    queryOptions({
      queryKey: ['auth', 'currentUser'] as const,
      queryFn: () => getUser(),
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchInterval: 1000 * 60 * 10, // 10 minutes
    }),
};

/**
 * Hook to get the current authenticated user
 * Uses suspense query for consistent loading patterns
 */
export function useCurrentUser() {
  return useSuspenseQuery(authQueries.currentUser());
}
