import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Send email verification OTP mutation
 * Hook handles: Logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 * Note: No auth state refresh needed - just sending verification email
 */
export function useSendEmailVerificationOTP() {
  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'sendEmailVerificationOTP'],
      mutationFn: async (
        data: Parameters<typeof authClient.emailOtp.sendVerificationOtp>[0],
      ) => {
        const result = await authClient.emailOtp.sendVerificationOtp(data);

        if (result.error) {
          throw new Error(
            result.error.message ?? 'Failed to send verification OTP',
          );
        }

        return result;
      },
      // Note: No onSuccess handler - just sending email, no auth state change
    }),
  });
}
