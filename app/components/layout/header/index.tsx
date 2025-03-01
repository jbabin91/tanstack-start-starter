import { Link } from '@tanstack/react-router';

import { useUser } from '~/features/users/hooks/use-user';

import { UserAvatar } from './user-avatar';

export function Header() {
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
        <UserAvatar />
      </div>
    </header>
  );
}
