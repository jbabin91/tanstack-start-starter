import { Link } from '@tanstack/react-router';

import { CenteredLayout } from '@/components/layouts/centered-layout';
import { Button } from '@/components/ui/button';

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <CenteredLayout>
      <div
        className="flex min-w-0 flex-1 flex-col items-center gap-6 p-4"
        role="alert"
        tabIndex={-1}
      >
        <div className="text-gray-600 dark:text-gray-400">
          {children ?? <p>The page you are looking for does not exist.</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => globalThis.history.back()}>
            Go back
          </Button>
          <Button>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </CenteredLayout>
  );
}
