import { Link } from '@tanstack/react-router';

import { ModeToggle } from '@/components/mode-toggle';
import { env } from '@/configs/env';

export function NavBar() {
  return (
    <header className="flex items-center justify-between border-b p-2">
      <nav className="flex items-center gap-2">
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
        <Link activeProps={{ className: 'font-bold' }} to="/feed">
          Feed
        </Link>
        {env.VITE_NODE_ENV === 'development' && (
          <Link activeProps={{ className: 'font-bold' }} to="/colors">
            Colors
          </Link>
        )}
      </nav>
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
