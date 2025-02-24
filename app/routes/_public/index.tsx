import { createFileRoute, Link } from '@tanstack/react-router';

import { Button } from '~/components/ui/button';
import { useUser } from '~/features/users/hooks/useUser';

export const Route = createFileRoute('/_public/')({
  component: Home,
});

function Home() {
  const { data: user } = useUser();

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-4xl font-bold">TanStarter</h1>
      <div className="flex items-center gap-2">
        This is an unprotected page:
        <pre className="bg-card text-card-foreground rounded-md border p-1">
          routes/_public/index.tsx
        </pre>
      </div>
      {user ? (
        <div className="flex flex-col gap-2">
          <p>Welcome back, {user.name}!</p>
          <Button asChild className="w-fit" size="sm">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <div>
            More data:
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p>You are not signed in.</p>
        </div>
      )}
    </div>
  );
}
