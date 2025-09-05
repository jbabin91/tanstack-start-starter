import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { useAuthStateHelpers } from '@/modules/auth/hooks/use-auth-state-helpers';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Sign in with email and password mutation
 * Hook handles: Query invalidation, auth state refresh, logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 */
export function useSignIn() {
  const { refreshAuthState } = useAuthStateHelpers();

  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'signIn'],
      mutationFn: async (
        data: Parameters<typeof authClient.signIn.email>[0],
      ) => {
        const result = await authClient.signIn.email(data);

        if (result.error) {
          throw new Error(result.error.message ?? 'Sign in failed');
        }

        return result;
      },
      onSuccess: async () => {
        // Hook-level: Handle auth state and queries - NO navigation here
        await refreshAuthState();
      },
    }),
  });
}
