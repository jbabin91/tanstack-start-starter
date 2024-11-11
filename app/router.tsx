import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';

import { DefaultCatchBoundary } from '@/components/errors/default-catch-boundary.tsx';
import { NotFound } from '@/components/errors/not-found.tsx';
import { queryClient } from '@/lib/query-client.ts';
import { routeTree } from '@/routeTree.gen.ts';

export function createRouter() {
  return routerWithQueryClient(
    createTanStackRouter({
      context: { queryClient },
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
      defaultPreload: 'intent',
      routeTree,
    }),
    queryClient,
  );
}

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
