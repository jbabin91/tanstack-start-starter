import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import * as React from 'react';

import { toast } from '@/components/ui/sonner.tsx';
import { logger } from '@/lib/logger.ts';

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context: { auth, i18n }, location, preload }) => {
    if (!auth?.isAuthenticated) {
      if (!preload) {
        logger.info('Authentication failed, redirecting to sign-in page');
        toast.error(i18n.translator('auth.authentication-failed'));
      }
      throw redirect({
        to: '/sign-in',
        search: {
          callbackURL: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
