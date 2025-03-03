import {
  type QueryClient,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { $getUserById } from '../api';

export const userProfileQuery = (userId: string) =>
  queryOptions({
    queryFn: async () => {
      const user = await $getUserById({ data: { userId } });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
    queryKey: ['users', 'profile', userId] as const,
  });

export function useUserProfile(userId: string) {
  return useQuery(userProfileQuery(userId));
}

export function ensureUserProfile(queryClient: QueryClient, userId: string) {
  return queryClient.ensureQueryData(userProfileQuery(userId));
}
