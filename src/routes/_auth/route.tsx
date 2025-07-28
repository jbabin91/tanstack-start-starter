import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { authClient } from '@/lib/auth/client';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && !isPending) {
      navigate({ to: '/dashboard' });
    }
  }, [session, isPending, navigate]);

  // Show loading while checking session
  if (isPending) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-muted-foreground mt-2 text-sm">Loading...</p>
        </div>
      </AuthLayout>
    );
  }

  // Don't render if user is authenticated (prevents flash)
  if (session) {
    return null;
  }

  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
