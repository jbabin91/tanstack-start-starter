import { type QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router';
import { Meta, Scripts } from '@tanstack/start';
import { Suspense } from 'react';

import { DefaultCatchBoundary } from '~/components/errors/default-catch-boundary';
import { TanstackQueryDevtools } from '~/components/utils/tanstack-query-devtools';
import { TanstackRouterDevtools } from '~/components/utils/tanstack-router-devtools';
import { seo } from '~/lib/utils/seo';
import { getUser } from '~/modules/users/api';
import { Providers } from '~/providers';
import appCss from '~/styles/app.css?url';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async () => {
    const user = await getUser();
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
  head: () => ({
    links: [
      { href: appCss, rel: 'stylesheet' },
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
              // @ts-expect-error - This route does not exist
              to="/this-route-does-not-exist"
            >
              This Route Does Not Exist
            </Link>
          </div>
          <hr />
          {children}
          <Suspense>
            <TanstackRouterDevtools position="bottom-left" />
            <TanstackQueryDevtools buttonPosition="bottom-right" />
          </Suspense>
          <Scripts />
        </Providers>
      </body>
    </html>
  );
}
