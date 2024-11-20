import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { t } from 'i18next';
import * as React from 'react';

import { toast } from '@/components/ui/sonner';
import { logger } from '@/lib/logger';

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context: { auth }, location, preload }) => {
    if (!auth?.isAuthenticated) {
      if (!preload) {
        logger.info('Authentication failed, redirecting to sign-in page');
        toast.error(t('auth.authentication-failed'));
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
