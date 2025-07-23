import { useSuspenseQuery } from '@tanstack/react-query';

import { postQueries } from '@/modules/posts/api';

// Fetch a post by ID
export function usePost(id: string) {
  return useSuspenseQuery(postQueries.byId(id));
}

// Fetch posts by user ID
export function usePostsByUserId(userId: string) {
  return useSuspenseQuery(postQueries.byUserId(userId));
}
