import { type QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';

import { routeTree } from '@/routeTree.gen.ts';

import { createQueryClient } from './query.ts';

export type RouterContext = {
  queryClient: QueryClient;
};

export function createRouter() {
  const queryClient = createQueryClient();

  const routerContext: RouterContext = {
    queryClient,
  };

  const router = createTanStackRouter({
    context: routerContext,
    defaultPreload: 'intent',
    routeTree,
    search: {
      strict: true,
    },
  });

  return routerWithQueryClient(router, queryClient);
}

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
