import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

import { postsQueryOptions } from '@/modules/posts/api';

export const Route = createFileRoute('/posts')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQueryOptions());
  },
  head: () => ({
    meta: [{ title: 'Posts' }],
  }),
});

function RouteComponent() {
  const postsQuery = useSuspenseQuery(postsQueryOptions());

  return (
    <div className="flex gap-2 p-2">
      <ul className="w-64 flex-shrink-0 pl-4">
        {[
          ...postsQuery.data,
          { id: 'i-do-not-exist', title: 'Non-existent Post' },
        ].map((post) => {
          return (
            <li key={post.id} className="whitespace-nowrap">
              <Link
                activeProps={{ className: 'text-black font-bold' }}
                className="block py-1 text-blue-800 hover:text-blue-600"
                params={{
                  postId: post.id.toString(),
                }}
                to="/posts/$postId"
              >
                <div>{post.title.slice(0, 20)}</div>
              </Link>
            </li>
          );
        })}
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
