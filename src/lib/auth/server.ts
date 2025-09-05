import { serverOnly } from '@tanstack/react-start';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  customSession,
  emailOTP,
  multiSession,
  organization,
  username,
} from 'better-auth/plugins';
import { reactStartCookies } from 'better-auth/react-start';

import { getUserMembership } from '@/lib/auth/utils/membership-queries';
import { db } from '@/lib/db';
import { authLogger } from '@/lib/logger';
import { sendEmailVerification } from '@/modules/email/templates/email-verification';
import { sendOTPVerification } from '@/modules/email/templates/otp-verification';
import { sendPasswordReset } from '@/modules/email/templates/password-reset';

import { resolveLocationAndIP } from './utils/location-resolver';
import { createSessionMetadata } from './utils/session-metadata-creator';

const options = {
  advanced: {
    database: {
      generateId: false,
      defaultFindManyLimit: 100, // Prevent unbounded queries
    },
    ipAddress: {
      // Prefer Cloudflare's true client IP header if available
      ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for', 'x-client-ip'],
      disableIpTracking: false, // Explicitly enable IP tracking
    },
    useSecureCookies: true, // Force secure cookies
    cookiePrefix: 'auth', // Add custom prefix for better organization
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax', // Better CSRF protection
    },
  },
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 100, // general requests per minute
    customRules: {
      // Stricter limits for OTP operations to prevent abuse
      '/email-otp/send-verification-otp': {
        window: 60, // 1 minute
        max: 3, // Only 3 OTP sends per minute per IP
      },
      '/email-otp/verify-email': {
        window: 300, // 5 minutes
        max: 10, // Max 10 verification attempts per 5 minutes
      },
      '/email-otp/check-verification-otp': {
        window: 300, // 5 minutes
        max: 10, // Match verification attempts
      },
      '/sign-in/email-otp': {
        window: 300, // 5 minutes
        max: 10, // Signin attempts per 5 minutes
      },
      // Additional protection for other sensitive endpoints
      '/sign-in/email': {
        window: 300, // 5 minutes
        max: 5, // Email/password login attempts
      },
      '/forget-password': {
        window: 300, // 5 minutes
        max: 3, // Password reset requests
      },
    },
    // Use database storage for persistence across restarts
    storage: 'database',
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
            authLogger.info(
              {
                organizationId: organization.id,
                organizationName: organization.name,
                userId: user.id,
              },
              'Organization created',
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
    emailOTP({
      allowedAttempts: 3, // 3 attempts before OTP becomes invalid
      expiresIn: 300, // 5 minutes (300 seconds)
      async sendVerificationOTP({ email, otp, type }) {
        // Send OTP via email using our template
        await sendOTPVerification({
          to: email,
          otp,
          type: type,
        });
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
    expiresIn: 60 * 60 * 24 * 7, // 7 days - longer session duration
    updateAge: 60 * 60 * 24, // 1 day - update expiration daily when used
    freshAge: 60 * 60 * 2, // 2 hours - require fresh session for sensitive operations
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
    storeSessionInDatabase: true, // Store sessions in database for better security
    preserveSessionInDatabase: false, // Clean up revoked sessions
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
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        // Send change email verification using existing email service
        await sendEmailVerification({
          to: newEmail,
          url,
          userName: user.name,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        // Send delete account verification
        await sendEmailVerification({
          to: user.email,
          url,
          userName: user.name,
        });
      },
      beforeDelete: async (user) => {
        // Log user deletion for audit purposes
        await Promise.resolve(
          authLogger.info(
            {
              userId: user.id,
              userEmail: user.email,
              userName: user.name,
            },
            'User account deletion initiated',
          ),
        );
      },
      afterDelete: async (user) => {
        // Log successful deletion
        await Promise.resolve(
          authLogger.info(
            {
              userId: user.id,
              userEmail: user.email,
            },
            'User account successfully deleted',
          ),
        );
      },
    },
  },
  logger: {
    disabled: false,
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    log: (level, message, ...args) => {
      // Use our existing logger for consistency
      authLogger[level === 'debug' ? 'debug' : level](
        {
          source: 'better-auth',
          args: args.length > 0 ? args : undefined,
        },
        message,
      );
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
