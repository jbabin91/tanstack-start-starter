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
import { sendEmail } from '@/modules/email/lib/resend';

export const auth = betterAuth({
  advanced: {
    database: {
      generateId: false,
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        subject: 'Reset your password',
        text: `Click the link to reset your password: ${url}`,
        to: user.email,
      });
    },
  },
  emailVerification: {
    async afterEmailVerification() {
      // Custom logic after verification
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        subject: 'Verify your email address',
        text: `Click the link to verify your email: ${url}`,
        to: user.email,
      });
    },
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
