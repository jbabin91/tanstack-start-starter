import { type QueryClient } from '@tanstack/react-query';
import {
  createRouter as createTanStackRouter,
  isRedirect,
  type RegisteredRouter,
  type useRouteContext,
} from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';

import { type Authed } from '@/lib/auth.ts';
import { createQueryClient } from '@/lib/query.ts';
import { type FileRouteTypes, routeTree } from '@/routeTree.gen.ts';

export type InferRouteContext<Route extends FileRouteTypes['to']> = ReturnType<
  typeof useRouteContext<RegisteredRouter, Route>
>;

export type RouterContext = {
  auth: Authed | null | undefined;
  queryClient: QueryClient;
};

export function createRouter() {
  const queryClient = createQueryClient();

  const routerContext: RouterContext = {
    auth: undefined,
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

  queryClient.getQueryCache().config.onError = handleRedirectError;
  queryClient.getMutationCache().config.onError = handleRedirectError;

  function handleRedirectError(error: Error) {
    if (isRedirect(error)) {
      router.navigate(
        router.resolveRedirect({
          ...error,
          _fromLocation: router.state.location,
        }),
      );
    }
  }

  return routerWithQueryClient(router, queryClient);
}

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
