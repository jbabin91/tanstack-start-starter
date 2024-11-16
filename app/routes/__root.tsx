import { type QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router';
import { Meta, Scripts } from '@tanstack/start';

import { DefaultCatchBoundary } from '@/components/errors/default-catch-boundary';
import { NotFound } from '@/components/errors/not-found';
import { ModeToggle } from '@/components/mode-toggle';
import { TailwindIndicator } from '@/components/utils/tailwind-indicator';
import { TanstackQueryDevtools } from '@/components/utils/tanstack-query-devtools';
import { TanstackRouterDevtools } from '@/components/utils/tanstack-router-devtools';
import { seo } from '@/lib/seo';
import { Providers } from '@/providers';
import globalCss from '@/styles/globals.css?url';

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  links: () => [
    { href: globalCss, rel: 'stylesheet' },
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
  meta: () => [
    {
      charSet: 'utf8',
    },
    {
      content: 'width=device-width, initial-scale=1',
      name: 'viewport',
    },
    ...seo({
      description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      title: 'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
    }),
  ],
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
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
          <div className="flex justify-between p-2">
            <div className="flex items-center gap-2">
              <Link className="[&.active]:font-bold" to="/">
                Home
              </Link>
              <Link className="[&.active]:font-bold" to="/about">
                About
              </Link>
              <Link className="[&.active]:font-bold" to="/todo">
                Todo
              </Link>
            </div>
            <div>
              <ModeToggle />
            </div>
          </div>
          <main>{children}</main>
        </Providers>
        <ScrollRestoration />
        <TailwindIndicator />
        <TanstackQueryDevtools />
        <TanstackRouterDevtools />
        <Scripts />
      </body>
    </html>
  );
}
