import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { type } from 'arktype';

import { AuthLayout } from '@/components/layouts/auth-layout';

const REDIRECT_URL = '/dashboard' as const;

const authSearchSchema = type({
  redirectUrl: 'string?',
});

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  validateSearch: authSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) {
      throw redirect({
        to: search.redirectUrl ?? REDIRECT_URL,
      });
    }
    return {
      redirectUrl: REDIRECT_URL,
    };
  },
});

function RouteComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
