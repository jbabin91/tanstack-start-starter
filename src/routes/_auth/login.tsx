import { createFileRoute, Link, useSearch } from '@tanstack/react-router';

import { LoginForm } from '@/modules/auth/components/login-form';
import { useAuth } from '@/modules/auth/hooks/use-auth';

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Sign In - TanStack Start Starter',
        name: 'title',
      },
      {
        name: 'description',
        content:
          'Sign in to your account to access your dashboard and personalized content.',
      },
    ],
  }),
});

function RouteComponent() {
  const search = useSearch({ from: '/_auth' });
  const { handleLoginSuccess } = useAuth();

  const onLoginSuccess = () => {
    handleLoginSuccess(search.redirectUrl);
  };

  return (
    <div className="space-y-6">
      <LoginForm onSuccess={onLoginSuccess} />

      <div className="space-y-4 text-center text-sm">
        <div className="text-muted-foreground flex items-center justify-center space-x-1">
          <span>Don&apos;t have an account?</span>
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to="/register"
          >
            Sign up
          </Link>
        </div>

        <div>
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to="/forgot-password"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
