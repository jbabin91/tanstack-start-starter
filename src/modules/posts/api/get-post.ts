import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { posts as postsTable } from '@/lib/db/schemas/posts';
import { logger } from '@/lib/logger';

export const fetchPostById = createServerFn()
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    logger.info(`Fetching post with id ${data}...`);

    const posts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, data));

    if (posts.length === 0) {
      throw new Error(`Post with id ${data} not found`);
    }

    return posts[0];
  });
