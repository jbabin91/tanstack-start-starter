import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import { Button } from '~/components/ui/button';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/signin' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-4xl font-bold">Dashboard Layout</h1>
      <div className="flex items-center gap-2">
        This is a protected route.
        <pre className="bg-card text-card-foreground rounded-md border p-1">
          routes/dashboard/route.tsx
        </pre>
      </div>
      <Button asChild className="w-fit" size="lg">
        <Link to="/">Back to home</Link>
      </Button>
      <Outlet />
    </div>
  );
}
