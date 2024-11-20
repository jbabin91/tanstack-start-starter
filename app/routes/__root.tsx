import {
  createRootRouteWithContext,
  type ErrorComponentProps,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router';
import { Meta, Scripts } from '@tanstack/start';
import geistMono from 'non.geist/mono?url';
import geist from 'non.geist?url';

import { DefaultCatchBoundary } from '@/components/errors/default-catch-boundary';
import { NotFound } from '@/components/errors/not-found';
import { Navbar } from '@/components/layout/navbar';
import { Typography } from '@/components/ui/typography';
import { TailwindIndicator } from '@/components/utils/tailwind-indicator';
import { TanstackQueryDevtools } from '@/components/utils/tanstack-query-devtools';
import { TanstackRouterDevtools } from '@/components/utils/tanstack-router-devtools';
import { type RouterContext } from '@/lib/router';
import { createMetadata } from '@/lib/seo';
import { authQueryOptions } from '@/modules/auth';
import { i18nQueryOptions } from '@/modules/i18n';
import { Providers } from '@/providers';
import globalCss from '@/styles/globals.css?url';

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    const [locale, auth] = await Promise.all([
      queryClient.ensureQueryData(i18nQueryOptions),
      queryClient.ensureQueryData(authQueryOptions()),
    ]);
    return {
      auth,
      locale,
    };
  },
  head: () => ({
    links: [
      { href: globalCss, rel: 'stylesheet' },
      { rel: 'stylesheet', href: geist },
      { rel: 'stylesheet', href: geistMono },
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
    meta: createMetadata({
      charSet: 'utf8',
      viewport: {
        width: 'device-width',
        'initial-scale': '1',
        'maximum-scale': '1',
        'user-scalable': 'no',
        'viewport-fit': 'cover',
      },
      title: 'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
      description: 'TanStack Start is a type-safe, client-first, full-stack React framework.',
      robots: 'index, follow',
    }),
    scripts: import.meta.env.PROD
      ? []
      : [
          {
            type: 'module',
            children: /* js */ `
          import RefreshRuntime from "/_build/@react-refresh"
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
        `,
          },
        ],
  }),
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
  pendingComponent: PendingComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </RootDocument>
  );
}

function PendingComponent() {
  return (
    <div className="space-y-6 p-6">
      <Typography.H1>Loading...</Typography.H1>
    </div>
  );
}

function ErrorComponent(props: ErrorComponentProps) {
  return (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  );
}

function NotFoundComponent() {
  return <NotFound />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <Meta />
      </head>
      <body>
        <Providers>{children}</Providers>
        <TailwindIndicator />
        <TanstackQueryDevtools />
        <TanstackRouterDevtools />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
