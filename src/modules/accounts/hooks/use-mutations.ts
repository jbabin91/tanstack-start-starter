import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { revokeSession } from '@/modules/accounts/api/revoke-session';
import { sessionQueries } from '@/modules/accounts/hooks/use-queries';

/**
 * Hook for revoking a session with optimistic updates and error handling
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onMutate: async ({ data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: sessionQueries.all().queryKey,
      });

      // Snapshot the previous value
      const previousSessions = queryClient.getQueryData(
        sessionQueries.all().queryKey,
      );

      // Optimistically update to remove the session
      queryClient.setQueryData(sessionQueries.all().queryKey, (old: any) => {
        if (!old) return old;
        return old.filter((session: any) => session.id !== data.sessionId);
      });

      // Return a context object with the snapshotted value
      return { previousSessions };
    },
    onSuccess: () => {
      toast.success('Session revoked successfully');
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSessions) {
        queryClient.setQueryData(
          sessionQueries.all().queryKey,
          context.previousSessions,
        );
      }
      toast.error('Failed to revoke session', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: sessionQueries.all().queryKey,
      });
    },
  });
}
