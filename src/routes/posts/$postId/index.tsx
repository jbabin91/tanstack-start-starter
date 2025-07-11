import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

import { postQueryOptions } from '@/modules/posts/api';
import { PostErrorComponent } from '@/modules/posts/components/post-error';
import { PostNotFoundComponent } from '@/modules/posts/components/post-not-found';

export const Route = createFileRoute('/posts/$postId/')({
  component: RouteComponent,
  loader: async ({ params: { postId }, context }) => {
    const data = await context.queryClient.ensureQueryData(
      postQueryOptions(Number(postId)),
    );

    return {
      title: data.title,
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
  errorComponent: PostErrorComponent,
  notFoundComponent: PostNotFoundComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  const postQuery = useSuspenseQuery(postQueryOptions(Number(postId)));

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">{postQuery.data.title}</h4>
      <div className="text-sm">{postQuery.data.body}</div>
      <Link
        activeProps={{ className: 'text-black font-bold' }}
        className="inline-block py-1 text-blue-800 hover:text-blue-600"
        params={{
          postId: postQuery.data.id.toString(),
        }}
        to="/posts/$postId/deep"
      >
        Deep View
      </Link>
    </div>
  );
}
