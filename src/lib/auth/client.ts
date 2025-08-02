import {
  adminClient,
  multiSessionClient,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    multiSessionClient(),
    organizationClient(),
    usernameClient(),
  ],
});
