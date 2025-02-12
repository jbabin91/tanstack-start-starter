import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Meta, Scripts } from '@tanstack/start';
import { Suspense } from 'react';

import { DefaultCatchBoundary } from '~/components/errors/default-catch-boundary';
import { Header } from '~/components/layout/header';
import { Spinner } from '~/components/spinner';
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
          <Header />
          {children}
          <Suspense fallback={<Spinner />}>
            <TanstackRouterDevtools position="bottom-left" />
            <TanstackQueryDevtools buttonPosition="bottom-right" />
          </Suspense>
          <Scripts />
        </Providers>
      </body>
    </html>
  );
}
