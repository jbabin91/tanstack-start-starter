/* eslint-disable unicorn/prefer-top-level-await */
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as React from 'react';
import { z } from 'zod';

import { toast } from '@/components/ui/sonner.tsx';
import { logger } from '@/lib/logger.ts';

const searchSchema = z.object({
  callbackURL: z.string().optional().catch(''),
});

export const Route = createFileRoute('/_auth')({
  validateSearch: zodValidator(searchSchema),
  beforeLoad: ({ context: { auth, i18n }, search, preload }) => {
    if (auth?.isAuthenticated) {
      if (!preload) {
        logger.info('Already authenticated, redirecting to callbackURL');
        toast.error(i18n.translator('auth.already-authenticated-redirecting'));
      }

      throw redirect({
        to: search.callbackURL,
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
