import {
  adminClient,
  customSessionClient,
  inferAdditionalFields,
  multiSessionClient,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from './server';

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    multiSessionClient(),
    organizationClient(),
    usernameClient(),
    customSessionClient<typeof auth>(),
    inferAdditionalFields<typeof auth>(),
  ],
});
