import { Link } from '@tanstack/react-router';

import { ModeToggle } from '@/components/mode-toggle';

export function NavBar() {
  return (
    <header className="flex items-center justify-between border-b p-2">
      <nav aria-label="Main navigation" className="flex items-center gap-2">
        <Link
          activeOptions={{ exact: true }}
          activeProps={{
            className: 'font-bold',
          }}
          to="/"
        >
          Home
        </Link>
        <Link activeProps={{ className: 'font-bold' }} to="/users">
          Users
        </Link>
        {import.meta.env.DEV && (
          <Link activeProps={{ className: 'font-bold' }} to="/colors">
            Colors
          </Link>
        )}
        {import.meta.env.DEV && (
          <Link activeProps={{ className: 'font-bold' }} to="/email">
            Email
          </Link>
        )}
      </nav>
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
