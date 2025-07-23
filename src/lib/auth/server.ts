import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  multiSession,
  organization,
  username,
} from 'better-auth/plugins';
import { reactStartCookies } from 'better-auth/react-start';

import { db } from '@/lib/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    reactStartCookies(),
    multiSession(),
    organization(),
    username(),
  ],
  user: {
    additionalFields: {
      address: {
        type: 'string',
      },
      phone: {
        type: 'string',
      },
      website: {
        type: 'string',
      },
    },
  },
});
