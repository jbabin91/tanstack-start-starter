import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { authQueries } from '@/modules/auth/hooks/use-current-user';

/**
 * Hook that provides auth state management helpers
 */
export function useAuthStateHelpers() {
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Refresh auth state after successful authentication
   * Invalidates user queries and router cache
   */
  const refreshAuthState = async () => {
    await queryClient.invalidateQueries({
      queryKey: authQueries.all().queryKey,
    });
    router.invalidate();
  };

  return {
    refreshAuthState,
  };
}
