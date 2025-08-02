import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';

import { authClient } from '@/lib/auth/client';
import { authQueries } from '@/modules/auth/hooks/use-current-user';

/**
 * Hook for handling authentication actions with proper state management
 * Provides consistent login success and sign out flows across the app
 */
export function useAuth() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  /**
   * Handle successful login by refreshing user context and navigating
   * @param redirectUrl - URL to redirect to after login (defaults to /dashboard)
   */
  const handleLoginSuccess = async (redirectUrl?: string) => {
    try {
      // Invalidate user query to refetch user data
      await queryClient.invalidateQueries({
        queryKey: authQueries.all().queryKey,
      });

      // Invalidate router context to refresh user data
      router.invalidate();

      // Navigate to destination
      navigate({
        to: redirectUrl ?? '/dashboard',
        replace: true,
      });
    } catch (error) {
      console.error('Post-login navigation error:', error);
    }
  };

  /**
   * Handle sign out by clearing session and redirecting to home
   */
  const handleSignOut = async () => {
    try {
      await authClient.signOut();

      // Invalidate user query and router context
      await queryClient.invalidateQueries({
        queryKey: authQueries.all().queryKey,
      });
      router.invalidate();

      // Navigate to home page
      navigate({ to: '/', replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  /**
   * Sign out and redirect to login page instead of home
   */
  const handleSignOutToLogin = async () => {
    try {
      await authClient.signOut();

      // Invalidate user query and router context
      await queryClient.invalidateQueries({
        queryKey: authQueries.all().queryKey,
      });
      router.invalidate();

      // Navigate to login page
      navigate({ to: '/login', replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    handleLoginSuccess,
    handleSignOut,
    handleSignOutToLogin,
  };
}
