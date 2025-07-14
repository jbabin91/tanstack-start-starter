import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { startTransition, useCallback } from 'react';

import { InfiniteScroll } from '@/components/ui/infinite-scroll/infinite-scroll';
import { Spinner } from '@/components/ui/spinner';
import { postQueries } from '@/modules/posts/api';

export const Route = createFileRoute('/feed')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'Posts Feed' }],
  }),
});

function RouteComponent() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...postQueries.infinite(),
      initialPageParam: undefined,
    });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleNext = useCallback(() => {
    startTransition(() => {
      fetchNextPage();
    });
  }, [fetchNextPage]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Posts Feed</h1>
      <InfiniteScroll
        className="h-[80vh]"
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        next={handleNext}
        sentinelClassName="bg-transparent"
        sentinelHeight={8}
        threshold={0.1}
      >
        <div className="space-y-6 pb-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-card rounded-lg border p-6 shadow-md"
            >
              <h2 className="text-card-foreground mb-2 text-xl font-semibold">
                {post.title}
              </h2>
              <p className="text-muted-foreground mb-4">{post.body}</p>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  User ID: {post.userId}
                </span>
                <Link
                  className="text-primary hover:text-primary/80 font-medium"
                  params={{
                    userId: post.userId?.toString() ?? '',
                  }}
                  to="/users/$userId"
                >
                  View User →
                </Link>
              </div>
            </div>
          ))}
          {isFetchingNextPage && hasNextPage && (
            <div className="flex justify-center py-4">
              <Spinner size="medium" />
            </div>
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
}
