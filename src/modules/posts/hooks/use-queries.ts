import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { fetchPostById } from '@/modules/posts/api/get-post';
import { fetchPostsByUserId } from '@/modules/posts/api/get-posts-by-user';

export const postQueries = {
  byId: (id: string) =>
    queryOptions({
      queryKey: ['posts', id] as const,
      queryFn: () => fetchPostById({ data: id }),
    }),
  byUserId: (userId: string) =>
    queryOptions({
      queryKey: ['posts', 'user', userId] as const,
      queryFn: () => fetchPostsByUserId({ data: userId }),
    }),
};

// Fetch a post by ID
export function usePost({ id }: { id: string }) {
  return useSuspenseQuery(postQueries.byId(id));
}

// Fetch posts by user ID
export function usePostsByUserId({ userId }: { userId: string }) {
  return useSuspenseQuery(postQueries.byUserId(userId));
}
