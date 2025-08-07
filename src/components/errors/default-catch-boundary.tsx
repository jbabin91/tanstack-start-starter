import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router';

import { CenteredLayout } from '@/components/layouts/centered-layout';
import { Button } from '@/components/ui/button';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    select: (state) => state.id === rootRouteId,
    strict: false,
  });

  console.error(error);

  return (
    <CenteredLayout>
      <div
        className="flex min-w-0 flex-1 flex-col items-center gap-6 p-4"
        role="alert"
        tabIndex={-1}
      >
        <ErrorComponent error={error} />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outlined"
            onClick={() => {
              router.invalidate();
            }}
          >
            Try Again
          </Button>
          <Button>
            {isRoot ? (
              <Link to="/">Home</Link>
            ) : (
              <Link
                to="/"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  globalThis.history.back();
                }}
              >
                Go Back
              </Link>
            )}
          </Button>
        </div>
      </div>
    </CenteredLayout>
  );
}
