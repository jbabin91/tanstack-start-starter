import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';

import { auth } from '@/lib/auth/server';
import { logger } from '@/lib/logger';

export const getUser = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { headers } = getWebRequest();
    const session = await auth.api.getSession({ headers });

    return session?.user ?? null;
  } catch (error) {
    // Handle database connection errors gracefully
    // Return null so public routes can still function
    logger.warn('Failed to get user session:', error);
    return null;
  }
});
