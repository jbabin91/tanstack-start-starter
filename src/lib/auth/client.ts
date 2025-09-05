import {
  adminClient,
  customSessionClient,
  emailOTPClient,
  inferAdditionalFields,
  multiSessionClient,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from './server';

export const authClient = createAuthClient({
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get('X-Retry-After');
        const seconds = retryAfter ? Number.parseInt(retryAfter) : 60;

        // Use dynamic import to avoid circular dependency
        const { toast } = await import('@/components/ui/sonner');
        toast.error('Too many requests', {
          description: `Please wait ${seconds} seconds before trying again.`,
          duration: 5000,
        });
      }
    },
  },
  plugins: [
    adminClient(),
    multiSessionClient(),
    organizationClient(),
    usernameClient(),
    emailOTPClient(),
    customSessionClient<typeof auth>(),
    inferAdditionalFields<typeof auth>(),
  ],
});

// Export better-auth inferred types
export type Session = typeof authClient.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;
export type Member = typeof authClient.$Infer.Member;
export type Organization = typeof authClient.$Infer.Organization;
export type Team = typeof authClient.$Infer.Team;
