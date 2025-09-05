import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Send email verification link mutation
 * Hook handles: Logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 * Note: No auth state refresh needed - just sending verification email
 */
export function useSendEmailVerificationLink() {
  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'sendEmailVerificationLink'],
      mutationFn: async (
        data: Parameters<typeof authClient.sendVerificationEmail>[0],
      ) => {
        const result = await authClient.sendVerificationEmail(data);

        if (result.error) {
          throw new Error(
            result.error.message ?? 'Failed to send verification email',
          );
        }

        return result;
      },
      // Note: No onSuccess handler - just sending email, no auth state change
    }),
  });
}
