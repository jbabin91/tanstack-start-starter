import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

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
 * Uses regular useQuery - most common pattern for components with manual loading states
 */
export function useCurrentUser() {
  return useQuery(authQueries.currentUser());
}

/**
 * Hook to get the current authenticated user with suspense
 * Uses suspense query to work with router-preloaded data
 * Use this in route components where data is preloaded
 */
export function useCurrentUserSuspense() {
  return useSuspenseQuery(authQueries.currentUser());
}
