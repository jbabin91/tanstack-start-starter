import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Sign up with email and password mutation
 * Hook handles: Logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 * Note: Don't invalidate auth state here - user needs email verification
 */
export function useSignUp() {
  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'signUp'],
      mutationFn: async (
        data: Parameters<typeof authClient.signUp.email>[0],
      ) => {
        const result = await authClient.signUp.email(data);

        if (result.error) {
          throw new Error(result.error.message ?? 'Sign up failed');
        }

        return result;
      },
      // Note: Don't invalidate auth state here - user needs email verification
    }),
  });
}
