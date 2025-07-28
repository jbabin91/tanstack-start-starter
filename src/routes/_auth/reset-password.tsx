import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { type } from 'arktype';

import { ResetPasswordForm } from '@/modules/auth/components/reset-password-form';

const resetPasswordSearchSchema = type({
  callbackURL: 'string?',
  token: 'string?',
});

export const Route = createFileRoute('/_auth/reset-password')({
  component: RouteComponent,
  validateSearch: resetPasswordSearchSchema,
  head: () => ({
    meta: [
      {
        name: 'title',
        title: 'Reset Password - TanStack Start Starter',
      },
      {
        name: 'description',
        content:
          'Set your new password using the secure link sent to your email address.',
      },
    ],
  }),
});

const handleResetError = (error: string) => {
  // Handle error (could show toast, etc.)
  console.error('Password reset error:', error);
};

function RouteComponent() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();

  const handleResetSuccess = () => {
    // Navigate to login page after successful password reset
    navigate({
      to: '/login',
    });
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-foreground text-2xl font-semibold">
            Invalid Reset Link
          </h1>
          <p className="text-muted-foreground mt-2">
            This password reset link is invalid or expired.
          </p>
        </div>

        <div className="text-center">
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to="/forgot-password"
          >
            Request a new password reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-foreground text-2xl font-semibold">
          Reset Your Password
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter your new password below.
        </p>
      </div>

      <ResetPasswordForm
        token={token}
        onError={handleResetError}
        onSuccess={handleResetSuccess}
      />

      <div className="text-center text-sm">
        <div className="text-muted-foreground flex items-center justify-center space-x-1">
          <span>Remember your password?</span>
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to="/login"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
