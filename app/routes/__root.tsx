import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Meta, Scripts } from '@tanstack/start';
import * as React from 'react';

import { DefaultCatchBoundary } from '~/components/default-catch-boundary';
import { NotFound } from '~/components/not-found';
import { Providers } from '~/providers';
import appCss from '~/styles/app.css?url';
import { seo } from '~/utils/seo';

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
      {
        href: '/apple-touch-icon.png',
        rel: 'apple-touch-icon',
        sizes: '180x180',
      },
      {
        href: '/favicon-32x32.png',
        rel: 'icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        href: '/favicon-16x16.png',
        rel: 'icon',
        sizes: '16x16',
        type: 'image/png',
      },
      { color: '#fffff', href: '/site.webmanifest', rel: 'manifest' },
      { href: '/favicon.ico', rel: 'icon' },
    ],
    meta: [
      {
        charSet: 'utf8',
      },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      ...seo({
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
        title:
          'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
      }),
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
    <html suppressHydrationWarning lang="en">
      <head>
        <Meta />
      </head>
      <body>
        <Providers>
          <div className="flex gap-2 p-2 text-lg">
            <Link
              activeOptions={{ exact: true }}
              activeProps={{
                className: 'font-bold',
              }}
              to="/"
            >
              Home
            </Link>{' '}
            <Link
              activeProps={{
                className: 'font-bold',
              }}
              to="/posts"
            >
              Posts
            </Link>{' '}
            <Link
              activeProps={{
                className: 'font-bold',
              }}
              to="/users"
            >
              Users
            </Link>{' '}
            <Link
              activeProps={{
                className: 'font-bold',
              }}
              to="/layout-a"
            >
              Layout
            </Link>{' '}
            <Link
              activeProps={{
                className: 'font-bold',
              }}
              to="/deferred"
            >
              Deferred
            </Link>{' '}
            <Link
              activeProps={{
                className: 'font-bold',
              }}
              // @ts-expect-error - This route does not exist
              to="/this-route-does-not-exist"
            >
              This Route Does Not Exist
            </Link>
          </div>
          <hr />
          {children}
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <Scripts />
        </Providers>
      </body>
    </html>
  );
}
