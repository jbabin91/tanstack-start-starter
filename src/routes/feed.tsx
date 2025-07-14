import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

import { postQueries } from '@/modules/posts/api';

export const Route = createFileRoute('/feed')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postQueries.all());
  },
  head: () => ({
    meta: [{ title: 'Posts Feed' }],
  }),
});

function RouteComponent() {
  const postsQuery = useSuspenseQuery(postQueries.all());

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Posts Feed</h1>
      <div className="space-y-6">
        {postsQuery.data.map((post) => (
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
      </div>
    </div>
  );
}
