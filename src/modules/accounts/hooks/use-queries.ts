import { queryOptions, useQuery } from '@tanstack/react-query';

import { fetchCurrentSession } from '@/modules/accounts/api/get-current-session';
import { fetchSessionActivity } from '@/modules/accounts/api/get-session-activity';
import { fetchSessions } from '@/modules/accounts/api/get-sessions';

// Simple query pattern - queryOptions with direct key access
export const sessionQueries = {
  all: () =>
    queryOptions({
      queryKey: ['sessions'] as const,
      queryFn: () => fetchSessions(),
      refetchInterval: 30_000,
      staleTime: 60_000,
    }),
  current: () =>
    queryOptions({
      queryKey: ['sessions', 'current'] as const,
      queryFn: () => fetchCurrentSession(),
      refetchInterval: 10_000,
      staleTime: 120_000,
    }),
  activity: (sessionId: string) =>
    queryOptions({
      queryKey: ['sessions', 'activity', sessionId] as const,
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
  return useQuery(sessionQueries.all());
}

/**
 * Hook to get current session information
 */
export function useCurrentSession() {
  return useQuery(sessionQueries.current());
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
