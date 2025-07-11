import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schemas/users';

export const fetchUsers = createServerFn().handler(async () => {
  console.info('Fetching users...');

  const users = await db.select().from(usersTable);
  return users;
});

export const usersQueryOptions = () =>
  queryOptions({
    queryFn: () => fetchUsers(),
    queryKey: ['users'],
  });

export const fetchUser = createServerFn()
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    console.info(`Fetching user with id ${data}...`);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, data));

    if (users.length === 0) {
      throw new Error(`User with id ${data} not found`);
    }

    return users[0];
  });

export const userQueryOptions = (userId: number) =>
  queryOptions({
    queryFn: () => fetchUser({ data: userId }),
    queryKey: ['user', userId],
  });
