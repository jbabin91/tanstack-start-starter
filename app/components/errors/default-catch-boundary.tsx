import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    select: (state) => state.id === rootRouteId,
    strict: false,
  });

  console.error(error);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
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
          <Link
            className={`rounded bg-gray-600 px-2 py-1 font-extrabold uppercase text-white dark:bg-gray-700`}
            to="/"
          >
            Home
          </Link>
        ) : (
          <Link
            className={`rounded bg-gray-600 px-2 py-1 font-extrabold uppercase text-white dark:bg-gray-700`}
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
