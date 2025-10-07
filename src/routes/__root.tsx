import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import * as React from 'react';

import { DefaultCatchBoundary } from '@/components/errors/default-catch-boundary';
import { NotFound } from '@/components/errors/not-found';
import { NavBar } from '@/components/layouts/nav-bar';
import { Toaster } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { type getUser } from '@/modules/auth/api/get-user';
import { authQueries } from '@/modules/auth/hooks/use-current-user';
import { Providers } from '@/providers';
import appCss from '@/styles/app.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  user: Awaited<ReturnType<typeof getUser>>;
}>()({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.fetchQuery(
      authQueries.currentUser(),
    );
    return { user };
  },
  component: RootComponent,
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  pendingComponent: () => (
    <div
      className="flex w-full items-center justify-center"
      style={{ minHeight: '60vh' }}
    >
      <Spinner size="large" />
    </div>
  ),
  head: () => ({
    links: [
      { href: appCss, rel: 'stylesheet' },
      { href: '/vite.svg', rel: 'icon' },
    ],
    meta: [
      { charSet: 'utf8' },
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
      { title: 'Tanstack Start Starter', name: 'title' },
    ],
  }),
  notFoundComponent: () => <NotFound />,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className="h-full" lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex h-full flex-col">
        <Providers>
          <NavBar />
          <main className="flex-1 overflow-auto">{children}</main>
          <Toaster />
        </Providers>
        <TanStackRouterDevtools />
        <ReactQueryDevtools />
        <Scripts />
      </body>
    </html>
  );
}
