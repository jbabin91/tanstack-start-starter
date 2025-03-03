import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { Resend } from 'resend';

import { renderVerificationEmail } from '~/features/email/components/verification';

import { nanoId } from '../utils/nanoid';
import { db } from './db';

const resend = new Resend(process.env.RESEND_API_KEY);

// Define supported social providers
type SocialProvider = 'github' | 'discord' | 'google';
// Add more providers here as we support them
// | 'twitter'
// | 'twitch'
// | 'apple'
// | 'facebook'
// | 'linkedin';

export const auth = betterAuth({
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: [
        'discord',
        'github',
        'google',
      ] satisfies SocialProvider[],
    },
  },
  advanced: {
    generateId: () => nanoId(),
  },
  baseURL: process.env.VITE_BASE_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  // https://www.better-auth.com/docs/authentication/email-password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  // https://www.better-auth.com/docs/concepts/email
  emailVerification: {
    autoSignInAfterVerification: true,
    enabled: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }, _request) => {
      const { react, text } = await renderVerificationEmail({
        user,
        verificationUrl: url,
      });

      await resend.emails.send({
        from: 'TanStack Start Starter <onboarding@starter.jacebabin.com>',
        react,
        subject: 'Verify your email address',
        text,
        to: user.email,
      });
    },
  },
  // https://www.better-auth.com/docs/concepts/session-management#session-caching
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  // https://www.better-auth.com/docs/concepts/oauth
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // Add additional user fields
  user: {
    additionalFields: {
      bio: {
        required: false,
        type: 'string',
      },
    },
  },
});
