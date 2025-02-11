import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

import { postsQueryOptions } from '~/utils/posts';

export const Route = createFileRoute('/posts')({
  component: PostsComponent,
  head: () => ({
    meta: [{ title: 'Posts' }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQueryOptions());
  },
});

function PostsComponent() {
  const postsQuery = useSuspenseQuery(postsQueryOptions());

  return (
    <div className="flex gap-2 p-2">
      <ul className="list-disc pl-4">
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
                  postId: post.id,
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
