import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { posts as postsTable } from '@/lib/db/schemas/posts';
import { logger } from '@/lib/logger';

export const postQueries = {
  byId: (id: string) =>
    queryOptions({
      queryFn: () => fetchPostById({ data: id }),
      queryKey: ['posts', id],
    }),
  byUserId: (userId: string) =>
    queryOptions({
      queryFn: () => fetchPostsByUserId({ data: userId }),
      queryKey: ['posts', 'user', userId],
    }),
};

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
