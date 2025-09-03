import { serverOnly } from '@tanstack/react-start';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  customSession,
  multiSession,
  organization,
  username,
} from 'better-auth/plugins';
import { reactStartCookies } from 'better-auth/react-start';

import { getUserMembership } from '@/lib/auth/utils/membership-queries';
import { db } from '@/lib/db';
import { sendEmailVerification } from '@/modules/email/templates/email-verification';
import { sendPasswordReset } from '@/modules/email/templates/password-reset';

import { resolveLocationAndIP } from './utils/location-resolver';
import { createSessionMetadata } from './utils/session-metadata-creator';

const options = {
  advanced: {
    database: {
      generateId: false,
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session, context) => {
          // Extract IP address using utility function
          const { ipAddress } = await resolveLocationAndIP(
            session.ipAddress,
            context?.request,
          );

          return {
            data: {
              ...session,
              ipAddress: ipAddress ?? session.ipAddress,
            },
          };
        },
        after: async (session, context) => {
          // Create session metadata after the session has been created in the database
          await createSessionMetadata({
            sessionId: session.id,
            sessionIP: session.ipAddress,
            request: context?.request,
          });
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordReset({
        to: user.email,
        url,
        userName: user.name,
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
      await sendEmailVerification({
        to: user.email,
        url,
        userName: user.name,
      });
    },
  },
  plugins: [
    admin(),
    reactStartCookies(),
    multiSession({
      maximumSessions: 5, // Allow up to 5 concurrent sessions per user
    }),
    organization({
      organizationCreation: {
        afterCreate: async ({ organization, user }) => {
          // Log organization creation
          await Promise.resolve(
            console.log(
              `Organization ${organization.name} created for user ${user.id}`,
            ),
          );
        },
      },
    }),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (username) => {
        // Prevent reserved usernames
        const reservedUsernames = [
          'admin',
          'root',
          'administrator',
          'support',
          'help',
          'api',
          'www',
          'mail',
          'ftp',
        ];
        if (reservedUsernames.includes(username.toLowerCase())) {
          return false;
        }
        // Ensure username contains only alphanumeric characters, underscores, and hyphens
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          return false;
        }
        // Ensure username doesn't start or end with special characters
        if (/^[-_]|[-_]$/.test(username)) {
          return false;
        }
        return true;
      },
      usernameNormalization: (username) => {
        // Normalize username by converting to lowercase and replacing confusing characters
        return username
          .toLowerCase()
          .replaceAll('0', 'o')
          .replaceAll('1', 'l')
          .replaceAll('3', 'e')
          .replaceAll('4', 'a')
          .replaceAll('5', 's');
      },
    }),
  ],
  session: {
    additionalFields: {
      activeOrganizationId: {
        type: 'string',
        required: false,
      },
    },
    freshAge: 60 * 60 * 2, // 2 hours - require fresh session for sensitive operations
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
  },
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
  telemetry: { enabled: false },
} satisfies BetterAuthOptions;

const getAuthConfig = serverOnly(() =>
  betterAuth({
    ...options,
    plugins: [
      ...(options.plugins ?? []),
      customSession(async ({ user, session }) => {
        // Get user's organization membership and role for permission computation
        const userMembership = await getUserMembership({
          userId: session.userId,
        });

        // Set active organization if not already set
        const activeOrganizationId =
          session.activeOrganizationId ??
          (userMembership.length > 0
            ? userMembership[0].organizationId
            : undefined);

        return {
          user,
          session: {
            ...session,
            activeOrganizationId,
          },
        };
      }, options),
    ],
  }),
);

export const auth = getAuthConfig();
