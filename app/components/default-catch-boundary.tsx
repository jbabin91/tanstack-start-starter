import {
  ErrorComponent,
  type ErrorComponentProps,
  rootRouteId,
  useMatch,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';

import { Button } from '~/components/ui/button';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const navigate = useNavigate();
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
          className={`rounded bg-gray-600 px-2 py-1 font-extrabold text-white uppercase dark:bg-gray-700`}
          onClick={() => {
            router.invalidate();
          }}
        >
          Try Again
        </Button>
        {isRoot ? (
          <Button className="uppercase" onClick={() => navigate({ to: '/' })}>
            Home
          </Button>
        ) : (
          <Button
            className="uppercase"
            onClick={(e) => {
              e.preventDefault();
              globalThis.history.back();
            }}
          >
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
}
