import { queryOptions, useQuery } from '@tanstack/react-query';

import { fetchCurrentSession } from '@/modules/accounts/api/get-current-session';
import { fetchSessionActivity } from '@/modules/accounts/api/get-session-activity';
import { fetchSessions } from '@/modules/accounts/api/get-sessions';

export const sessionQueries = {
  all: () => ['sessions'] as const,
  lists: () => [...sessionQueries.all(), 'list'] as const,
  list: () =>
    queryOptions({
      queryKey: [...sessionQueries.lists()],
      queryFn: () => fetchSessions(),
      refetchInterval: 30_000,
      staleTime: 60_000,
    }),
  details: () => [...sessionQueries.all(), 'detail'] as const,
  detail: (type: 'current') =>
    queryOptions({
      queryKey: [...sessionQueries.details(), type],
      queryFn: () => fetchCurrentSession(),
      refetchInterval: 10_000,
      staleTime: 120_000,
    }),
  activity: (sessionId: string) =>
    queryOptions({
      queryKey: [...sessionQueries.all(), 'activity', sessionId],
      queryFn: () => fetchSessionActivity({ data: { sessionId } }),
      enabled: !!sessionId,
      refetchInterval: 300_000, // 5 minutes
      staleTime: 180_000, // 3 minutes
    }),
};

/**
 * Hook to get all sessions for the current user
 */
export function useSessions() {
  return useQuery(sessionQueries.list());
}

/**
 * Hook to get current session information
 */
export function useCurrentSession() {
  return useQuery(sessionQueries.detail('current'));
}

/**
 * Hook to get session activity for a specific session
 */
export function useSessionActivity({
  sessionId,
  enabled = true,
}: {
  sessionId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    ...sessionQueries.activity(sessionId ?? ''),
    enabled: enabled && !!sessionId,
  });
}
