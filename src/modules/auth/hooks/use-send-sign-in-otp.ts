import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Send sign-in OTP mutation
 * Hook handles: Logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 * Note: No auth state refresh needed - just sending OTP email for sign-in
 */
export function useSendSignInOTP() {
  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'sendSignInOTP'],
      mutationFn: async (
        data: Parameters<typeof authClient.emailOtp.sendVerificationOtp>[0],
      ) => {
        const result = await authClient.emailOtp.sendVerificationOtp(data);

        if (result.error) {
          throw new Error(result.error.message ?? 'Failed to send sign-in OTP');
        }

        return result;
      },
      // Note: No onSuccess handler - just sending email, no auth state change
    }),
  });
}
