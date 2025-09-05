import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Reset password mutation
 * Hook handles: Logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 * Note: No auth state refresh needed - user not logged in yet
 */
export function useResetPassword() {
  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'resetPassword'],
      mutationFn: async (
        data: Parameters<typeof authClient.resetPassword>[0],
      ) => {
        const result = await authClient.resetPassword(data);

        if (result.error) {
          throw new Error(result.error.message ?? 'Password reset failed');
        }

        return result;
      },
      // Note: No onSuccess handler - user not logged in yet, no auth state to refresh
    }),
  });
}
