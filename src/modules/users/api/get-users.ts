import { createServerFn } from '@tanstack/react-start';

import { db } from '@/lib/db';
import { users as usersTable } from '@/lib/db/schemas/auth';
import { logger } from '@/lib/logger';

export const fetchUsers = createServerFn().handler(async () => {
  logger.info('Fetching users...');

  const users = await db.select().from(usersTable);
  return users;
});
