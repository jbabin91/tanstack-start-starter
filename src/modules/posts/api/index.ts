import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';

import { jsonPlaceholderApiClient } from '@/lib/axios';

export type Post = {
  id: string;
  title: string;
  body: string;
};

export const fetchPosts = createServerFn().handler(async () => {
  console.info('Fetching posts...');

  // The axios interceptor will handle errors automatically
  const response = await jsonPlaceholderApiClient.get<Post[]>('/posts');
  return response.data.slice(0, 10);
});

export const postsQueryOptions = () =>
  queryOptions({
    queryFn: () => fetchPosts(),
    queryKey: ['posts'],
  });

export const fetchPost = createServerFn()
  .validator((d: string) => d)
  .handler(async ({ data }) => {
    console.info(`Fetching post with id ${data}...`);

    // The axios interceptor will handle 404s and other errors automatically
    const response = await jsonPlaceholderApiClient.get<Post>(`/posts/${data}`);
    return response.data;
  });

export const postQueryOptions = (postId: string) =>
  queryOptions({
    queryFn: () => fetchPost({ data: postId }),
    queryKey: ['post', postId],
  });
