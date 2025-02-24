import { useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';

import { ModeToggle } from '~/components/mode-toggle';
import { Button } from '~/components/ui/button';
import { userQuery, useUser } from '~/features/users/hooks/useUser';
import { authClient } from '~/lib/client/auth-client';

export function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return (
    <header className="flex justify-between border-b p-2">
      <nav className="flex items-center gap-4 text-lg">
        <Link
          activeOptions={{ exact: true }}
          activeProps={{
            className: 'font-bold',
          }}
          to="/"
        >
          Home
        </Link>
        {user ? (
          <Link
            activeProps={{
              className: 'font-bold',
            }}
            to="/dashboard"
          >
            Dashboard
          </Link>
        ) : null}
        <Link
          activeProps={{
            className: 'font-bold',
          }}
          // @ts-expect-error - This route does not exist
          to="/this-route-does-not-exist"
        >
          This Route Does Not Exist
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <Button
            onClick={async () => {
              await authClient.signOut();
              await queryClient.resetQueries({
                queryKey: userQuery.queryKey,
              });
              await router.navigate({ to: '/' });
            }}
            variant="ghost"
            size="sm"
          >
            Sign out
          </Button>
        ) : (
          <>
            <Link
              activeProps={{
                className: 'font-bold',
              }}
              to="/signin"
            >
              Sign in
            </Link>
            <Link
              activeProps={{
                className: 'font-bold',
              }}
              to="/signup"
            >
              Sign up
            </Link>
          </>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}
