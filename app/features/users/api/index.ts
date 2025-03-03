import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { logger } from 'better-auth';
import { eq } from 'drizzle-orm';
import { z, type z as zodZ } from 'zod';

import { auth } from '~/lib/server/auth';
import { db } from '~/lib/server/db';
import { users } from '~/lib/server/schema/auth.schema';

export const $getUser = createServerFn().handler(async () => {
  const { headers } = getWebRequest()!;
  const session = await auth.api.getSession({ headers });
  return session?.user;
});

const userQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

type UserQuery = zodZ.infer<typeof userQuerySchema>;

export const $getUserById = createServerFn()
  .validator((data: unknown): UserQuery => userQuerySchema.parse(data))
  .handler(async ({ data }) => {
    logger.info('Getting user by ID', { userId: data.userId });

    try {
      // Get the user from the database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, data.userId))
        .execute();

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Failed to get user by ID', { error, userId: data.userId });
    }
  });
