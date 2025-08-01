import { queryOptions } from '@tanstack/react-query';

import { fetchCurrentSession } from '@/modules/sessions/api/get-current-session';
import { fetchSessionActivity } from '@/modules/sessions/api/get-session-activity';
import { fetchSessions } from '@/modules/sessions/api/get-sessions';

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
