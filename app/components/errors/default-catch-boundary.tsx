import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router';

import { Button, buttonVariants } from '@/components/ui/button.tsx';
import { Typography } from '@/components/ui/typography.tsx';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    select: (state) => state.id === rootRouteId,
    strict: false,
  });

  console.error(error);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <Typography.H1>Something went wrong</Typography.H1>
      <ErrorComponent error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => {
            router.invalidate();
          }}
        >
          Try Again
        </Button>
        {isRoot ? (
          <Link className={buttonVariants({ variant: 'secondary' })} to="/">
            Home
          </Link>
        ) : (
          <Link
            className={buttonVariants({ variant: 'secondary' })}
            to="/"
            onClick={(e) => {
              e.preventDefault();
              globalThis.history.back();
            }}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  );
}
