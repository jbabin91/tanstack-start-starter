import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { postsTable } from '@/lib/db/schemas/posts';

export const fetchPosts = createServerFn().handler(async () => {
  console.info('Fetching posts...');

  const posts = await db.select().from(postsTable).limit(10);
  return posts;
});

export const postsQueryOptions = () =>
  queryOptions({
    queryFn: () => fetchPosts(),
    queryKey: ['posts'],
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

export const postQueryOptions = (postId: number) =>
  queryOptions({
    queryFn: () => fetchPost({ data: postId }),
    queryKey: ['post', postId],
  });
