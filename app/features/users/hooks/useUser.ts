import {
  type QueryClient,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';

import { $getUser } from '../api';

export const userQuery = queryOptions({
  queryFn: () => $getUser(),
  queryKey: ['user'] as const,
});

export function useUser() {
  return useQuery(userQuery);
}

export function ensureUser(queryClient: QueryClient) {
  return queryClient.ensureQueryData(userQuery);
}
