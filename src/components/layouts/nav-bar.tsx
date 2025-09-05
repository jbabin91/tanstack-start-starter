import { Link, useNavigate } from '@tanstack/react-router';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/modules/auth/hooks/use-current-user';
import { useSignOut } from '@/modules/auth/hooks/use-sign-out';

export function NavBar() {
  const { data: user } = useCurrentUser();
  const signOutMutation = useSignOut();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        // Component handles navigation - proper callback separation
        navigate({ to: '/', replace: true });
      },
    });
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm">
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
        {user && (
          <Link
            activeProps={{ className: 'font-semibold text-foreground' }}
            className="text-foreground/80 hover:text-foreground transition-colors"
            to="/dashboard"
          >
            Dashboard
          </Link>
        )}
        {user && (
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
        {user ? (
          <>
            <span className="text-muted-foreground hidden text-sm sm:inline">
              Welcome, {user.name}
            </span>
            <Button
              loading={signOutMutation.isPending}
              size="sm"
              variant="outlined"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button size="sm" variant="ghost">
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
