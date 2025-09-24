import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users as usersTable } from '@/lib/db/schemas/auth';
import { apiLogger } from '@/lib/logger';

export const fetchUser = createServerFn()
  .inputValidator((d: string) => d)
  .handler(async ({ data }) => {
    apiLogger.info(`Fetching user with id ${data}...`);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, data));

    if (users.length === 0) {
      throw new Error(`User with id ${data} not found`);
    }

    return users[0];
  });
