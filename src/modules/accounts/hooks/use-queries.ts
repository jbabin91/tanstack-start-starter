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
      refetchInterval: 1000 * 60 * 3, // 3 minutes
      staleTime: 1000 * 60 * 2, // 2 minutes
    }),
  details: () => [...sessionQueries.all(), 'detail'] as const,
  detail: (type: 'current') =>
    queryOptions({
      queryKey: [...sessionQueries.details(), type],
      queryFn: () => fetchCurrentSession(),
      refetchInterval: 1000 * 60 * 2, // 2 minutes
      staleTime: 1000 * 60, // 1 minute
    }),
  activity: (sessionId: string) =>
    queryOptions({
      queryKey: [...sessionQueries.all(), 'activity', sessionId],
      queryFn: () => fetchSessionActivity({ data: { sessionId } }),
      enabled: !!sessionId,
      refetchInterval: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 60 * 3, // 3 minutes
    }),
};

/**
 * Get all sessions for the current user
 * @returns The list of sessions
 */
export function useSessions() {
  return useQuery(sessionQueries.list());
}

/**
 * Get current session information
 * @returns The current session
 */
export function useCurrentSession() {
  return useQuery(sessionQueries.detail('current'));
}

/**
 * Get session activity for a specific session
 * @param sessionId - The ID of the session to get activity for
 * @param enabled - Whether to enable the query
 * @returns The session activity
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
