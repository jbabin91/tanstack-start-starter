import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';

import { authClient } from '~/lib/client/auth-client';

const verifySchema = z.object({
  token: z.string(),
});

const REDIRECT_URL = '/dashboard';

export const Route = createFileRoute('/_auth/verify')({
  validateSearch: (search: unknown) => verifySchema.parse(search),
  beforeLoad: async ({ search }) => {
    const verifyEmail = authClient.verifyEmail.bind(authClient);
    try {
      await verifyEmail({
        query: {
          token: search.token,
          callbackURL: REDIRECT_URL,
        },
      });
      throw redirect({ to: REDIRECT_URL });
    } catch {
      throw redirect({
        to: '/signin',
        search: {
          callbackURL: REDIRECT_URL,
        },
      });
    }
  },
  component: () => null,
});
