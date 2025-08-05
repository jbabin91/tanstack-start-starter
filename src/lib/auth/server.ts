import { serverOnly } from '@tanstack/react-start';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  multiSession,
  organization,
  username,
} from 'better-auth/plugins';
import { reactStartCookies } from 'better-auth/react-start';

import { getUserFirstMembership } from '@/lib/auth/utils/membership-queries';
import { db } from '@/lib/db';
import { members, organizations } from '@/lib/db/schemas/auth';
import { nanoid } from '@/lib/nanoid';
import { sendEmailVerification } from '@/modules/email/templates/email-verification';
import { sendPasswordReset } from '@/modules/email/templates/password-reset';

import { extractIPAddress } from './utils/ip-extraction';
import { createSessionMetadata } from './utils/session-metadata-creator';

const getAuthConfig = serverOnly(() =>
  betterAuth({
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
      user: {
        create: {
          after: async (user) => {
            // Auto-create a personal organization for new users
            const orgId = nanoid();
            const orgSlug = `${(user as any).username ?? user.name.toLowerCase().replaceAll(/\s+/g, '-')}-${orgId.slice(-6)}`;

            // Create the organization
            await db.insert(organizations).values({
              id: orgId,
              name: `${user.name}'s Organization`,
              slug: orgSlug,
              createdAt: new Date(),
            });

            // Add user as owner of their personal organization
            await db.insert(members).values({
              id: nanoid(),
              organizationId: orgId,
              userId: user.id,
              role: 'owner',
              createdAt: new Date(),
            });
          },
        },
      },
      session: {
        create: {
          before: async (session, context) => {
            // Extract IP address using utility function
            const { ipAddress } = extractIPAddress(
              session.ipAddress,
              context?.request,
            );

            // Get user's organization membership and role for permission computation
            const userMembership = await getUserFirstMembership(session.userId);

            // Set active organization if not already set
            const activeOrganizationId =
              (session as any).activeOrganizationId ??
              (userMembership.length > 0
                ? userMembership[0].organizationId
                : undefined);

            return {
              data: {
                ...session,
                activeOrganizationId,
                ipAddress: ipAddress ?? session.ipAddress,
              },
            };
          },
          after: async (session, context) => {
            // Create session metadata using utility function
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
  }),
);

export const auth = getAuthConfig();
