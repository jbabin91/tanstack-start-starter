import { createServerFn } from '@tanstack/react-start';

import { db } from '@/lib/db';
import { users as usersTable } from '@/lib/db/schemas/auth';
import { apiLogger } from '@/lib/logger';

export const fetchUsers = createServerFn().handler(async () => {
  return apiLogger.timedAsync('fetch-users', async () => {
    apiLogger.info('Fetching all users');

    const users = await db.select().from(usersTable);

    apiLogger.info({ userCount: users.length }, 'Successfully fetched users');
    return users;
  });
});
