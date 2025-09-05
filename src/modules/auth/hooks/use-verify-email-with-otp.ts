import { useMutation } from '@tanstack/react-query';

import { authClient } from '@/lib/auth/client';
import { useAuthStateHelpers } from '@/modules/auth/hooks/use-auth-state-helpers';
import { createAuthMutationOptions } from '@/modules/auth/utils/auth-mutation-options';

/**
 * Verify email with OTP mutation
 * Hook handles: Query invalidation, auth state refresh, logging
 * Component should handle: Navigation, UI feedback (toasts, etc.)
 */
export function useVerifyEmailWithOTP() {
  const { refreshAuthState } = useAuthStateHelpers();

  return useMutation({
    ...createAuthMutationOptions({
      mutationKey: ['auth', 'verifyEmailWithOTP'],
      mutationFn: async (
        data: Parameters<typeof authClient.emailOtp.verifyEmail>[0],
      ) => {
        const result = await authClient.emailOtp.verifyEmail(data);

        if (result.error) {
          throw new Error(result.error.message ?? 'Email verification failed');
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
