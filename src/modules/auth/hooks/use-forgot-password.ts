import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Forgot password mutation
 * Hook handles: Logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 * Note: No auth state refresh needed - user not logged in
 */
export function useForgotPassword() {
  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'forgotPassword'],
      mutationFn: async (
        data: Parameters<typeof authClient.forgetPassword>[0],
      ) => {
        const result = await authClient.forgetPassword(data);

        if (result.error) {
          throw new Error(result.error.message ?? 'Failed to send reset email');
        }

        return result;
      },
      // Note: No onSuccess handler - user not logged in, no auth state to refresh
    }),
  });
}
