import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { RegisterForm } from '@/modules/auth/components/register-form';

export const Route = createFileRoute('/_auth/register')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Create Account - TanStack Start Starter',
        name: 'title',
      },
      {
        name: 'description',
        content:
          'Create a new account to start using our platform with personalized features and secure access.',
      },
    ],
  }),
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate({ to: '/verify-email' });
  };

  return (
    <div className="space-y-6">
      <RegisterForm onSuccess={handleRegisterSuccess} />

      <div className="text-center text-sm">
        <div className="text-muted-foreground flex items-center justify-center space-x-1">
          <span>Already have an account?</span>
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to="/login"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
