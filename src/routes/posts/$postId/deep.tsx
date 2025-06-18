import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

import { postQueryOptions } from '@/modules/posts/api';
import { PostErrorComponent } from '@/modules/posts/components/post-error';

export const Route = createFileRoute('/posts/$postId/deep')({
  component: RouteComponent,
  loader: async ({ params: { postId }, context }) => {
    const data = await context.queryClient.ensureQueryData(
      postQueryOptions(postId),
    );

    return {
      title: data.title,
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
  errorComponent: PostErrorComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  const postQuery = useSuspenseQuery(postQueryOptions(postId));

  return (
    <div className="space-y-2 p-2">
      <Link
        className="block py-1 text-blue-800 hover:text-blue-600"
        to="/posts"
      >
        ← All Posts
      </Link>
      <h4 className="text-xl font-bold underline">{postQuery.data.title}</h4>
      <div className="text-sm">{postQuery.data.body}</div>
    </div>
  );
}
