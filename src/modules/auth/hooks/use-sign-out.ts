import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { useAuthStateHelpers } from '@/modules/auth/hooks/use-auth-state-helpers';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Sign out mutation
 * Hook handles: Auth state refresh, query invalidation, logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 */
export function useSignOut() {
  const { refreshAuthState } = useAuthStateHelpers();

  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'signOut'],
      mutationFn: async () => {
        await authClient.signOut();
      },
      onSuccess: async () => {
        // Hook-level: Handle auth state refresh - NO navigation here
        await refreshAuthState();
      },
    }),
  });
}
