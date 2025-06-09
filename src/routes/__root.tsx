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
import { Providers } from '@/providers';
import appCss from '@/styles/app.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  head: () => ({
    links: [
      { href: appCss, rel: 'stylesheet' },
      { href: '/vite.svg', rel: 'icon' },
    ],
    meta: [
      { charSet: 'utf8' },
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>
          <NavBar />
          <main>{children}</main>
        </Providers>
        <TanStackRouterDevtools />
        <ReactQueryDevtools />
        <Scripts />
      </body>
    </html>
  );
}
