import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { posts as postsTable } from '@/lib/db/schemas/posts';
import { logger } from '@/lib/logger';

export const fetchPostsByUserId = createServerFn()
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    logger.info(`Fetching posts for user with id ${data}...`);

    const posts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.userId, data));

    return posts;
  });
