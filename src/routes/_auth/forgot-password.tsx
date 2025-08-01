import { createFileRoute, Link } from '@tanstack/react-router';

import { ForgotPasswordForm } from '@/modules/auth/components/forgot-password-form';

export const Route = createFileRoute('/_auth/forgot-password')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        name: 'title',
        title: 'Reset Password - TanStack Start Starter',
      },
      {
        name: 'description',
        content:
          'Reset your password by entering your email address. We will send you a secure link to create a new password.',
      },
    ],
  }),
});

function handleResetSuccess() {
  // The form component will handle showing the email sent state
  // No navigation needed here as the form shows inline feedback
}

function RouteComponent() {
  return (
    <div className="space-y-6">
      <ForgotPasswordForm onSuccess={handleResetSuccess} />

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
