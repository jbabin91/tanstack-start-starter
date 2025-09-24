import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { posts as postsTable } from '@/lib/db/schemas/posts';
import { apiLogger } from '@/lib/logger';

export const fetchPostsByUserId = createServerFn()
  .inputValidator((d: string) => d)
  .handler(async ({ data }) => {
    apiLogger.info(`Fetching posts for user with id ${data}...`);

    const posts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.userId, data));

    return posts;
  });
