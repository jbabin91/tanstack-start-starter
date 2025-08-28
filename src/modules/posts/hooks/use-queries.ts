import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { fetchPostById } from '@/modules/posts/api/get-post';
import { fetchPostsByUserId } from '@/modules/posts/api/get-posts-by-user';

export const postQueries = {
  all: () => ['posts'] as const,
  details: () => [...postQueries.all(), 'detail'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...postQueries.details(), id],
      queryFn: () => fetchPostById({ data: id }),
    }),
  byUser: (userId: string) =>
    queryOptions({
      queryKey: [...postQueries.all(), 'byUser', userId],
      queryFn: () => fetchPostsByUserId({ data: userId }),
    }),
};

/**
 * Get a post by ID
 * @param param0 - The ID of the post to get
 * @returns The post
 */
export function usePost({ id }: { id: string }) {
  return useSuspenseQuery(postQueries.detail(id));
}

/**
 * Get posts by user ID
 * @param param0 - The ID of the user to get posts for
 * @returns The posts
 */
export function usePostsByUserId({ userId }: { userId: string }) {
  return useSuspenseQuery(postQueries.byUser(userId));
}
