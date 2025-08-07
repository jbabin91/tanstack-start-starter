import { Link } from '@tanstack/react-router';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import { useAuth } from '@/modules/auth/hooks/use-auth';

export function NavBar() {
  const { data: session } = authClient.useSession();
  const { handleSignOut } = useAuth();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 backdrop-blur">
      <nav aria-label="Main navigation" className="flex items-center gap-4">
        <Link
          activeOptions={{ exact: true }}
          activeProps={{
            className: 'font-semibold text-foreground',
          }}
          className="text-foreground/80 hover:text-foreground transition-colors"
          to="/"
        >
          TanStack Start
        </Link>
        {session && (
          <Link
            activeProps={{ className: 'font-semibold text-foreground' }}
            className="text-foreground/80 hover:text-foreground transition-colors"
            to="/dashboard"
          >
            Dashboard
          </Link>
        )}
        {session && (
          <Link
            activeProps={{ className: 'font-semibold text-foreground' }}
            className="text-foreground/80 hover:text-foreground transition-colors"
            to="/users"
          >
            Users
          </Link>
        )}
        {import.meta.env.DEV && (
          <Link
            activeProps={{ className: 'font-semibold text-foreground' }}
            className="text-foreground/80 hover:text-foreground transition-colors"
            to="/demo"
          >
            Demo
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-3">
        {session ? (
          <>
            <span className="text-muted-foreground hidden text-sm sm:inline">
              Welcome, {session.user.name}
            </span>
            <Button size="sm" variant="outlined" onClick={handleSignOut}>
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button size="sm" variant="text">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </>
        )}
        <ModeToggle />
      </div>
    </header>
  );
}
