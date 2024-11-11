import { lazy } from 'react';

export const TanstackQueryDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : lazy(() =>
      // Lazy load in development
      import('@tanstack/react-query-devtools').then((res) => ({
        default: res.ReactQueryDevtools,
        // For Embedded Mode
        // default: res.ReactQueryDevtools
      })),
    );
