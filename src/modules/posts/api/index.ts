import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, lt } from 'drizzle-orm';

import { db } from '@/lib/db';
import { postsTable } from '@/lib/db/schemas/posts';

export const postQueries = {
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
  infinite: () => ({
    getNextPageParam: (lastPage: { nextCursor: number | null }) =>
      lastPage.nextCursor,
    initialPageParam: undefined,
    queryFn: (context: { pageParam?: number | null }) =>
      fetchPosts({ data: { cursor: context.pageParam ?? null, limit: 10 } }),
    queryKey: ['posts', 'infinite'],
  }),
};

export const fetchPosts = createServerFn()
  .validator(
    (input: {
      limit?: number;
      cursor?: number | null;
      userId?: number | null;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { limit = 10, cursor = null, userId = null } = data || {};
    console.info('Fetching posts...', { cursor, limit, userId });

    const whereClauses = [
      userId === null ? undefined : eq(postsTable.userId, userId),
      cursor === null ? undefined : lt(postsTable.id, cursor),
    ].filter(Boolean);

    const posts = await db
      .select()
      .from(postsTable)
      .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
      .orderBy(desc(postsTable.id))
      .limit(limit + 1);

    let nextCursor: number | null = null;
    if (posts.length > limit) {
      nextCursor = posts[limit].id;
      posts.length = limit;
    }
    return { nextCursor, posts };
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
