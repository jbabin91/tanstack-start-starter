import { lazy } from 'react';

export const TanstackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : lazy(() =>
      // Lazy load in development
      import('@tanstack/router-devtools').then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    );
