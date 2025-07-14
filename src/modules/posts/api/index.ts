import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { postsTable } from '@/lib/db/schemas/posts';

export const postQueries = {
  all: () =>
    queryOptions({
      queryFn: () => fetchPosts(),
      queryKey: ['posts'],
    }),
  byId: (id: number) =>
    queryOptions({
      queryFn: () => fetchPost({ data: id }),
      queryKey: ['posts', id],
    }),
  byUserId: (userId: number) =>
    queryOptions({
      queryFn: () => fetchPostsByUserId({ data: userId }),
      queryKey: ['posts', 'user', userId],
    }),
};

export const fetchPosts = createServerFn().handler(async () => {
  console.info('Fetching posts...');

  const posts = await db.select().from(postsTable).limit(10);
  return posts;
});

export const fetchPost = createServerFn()
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    console.info(`Fetching post with id ${data}...`);

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
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    console.info(`Fetching posts for user with id ${data}...`);

    const posts = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.userId, data));

    return posts;
  });
