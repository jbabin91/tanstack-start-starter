import { Link } from '@tanstack/react-router';

import { ModeToggle } from '~/components/mode-toggle';

export function Header() {
  return (
    <header className="flex justify-between border-b p-2">
      <nav className="flex items-center gap-2 text-lg">
        <Link
          activeOptions={{ exact: true }}
          activeProps={{
            className: 'font-bold',
          }}
          to="/"
        >
          Home
        </Link>{' '}
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
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
