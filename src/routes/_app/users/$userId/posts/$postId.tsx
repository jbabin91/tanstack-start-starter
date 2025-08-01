import { createFileRoute, Link } from '@tanstack/react-router';

import { PostErrorComponent } from '@/modules/posts/components/post-error';
import { PostNotFoundComponent } from '@/modules/posts/components/post-not-found';
import { postQueries, usePost } from '@/modules/posts/hooks/use-queries';
import { userQueries, useUser } from '@/modules/users/hooks/use-queries';

export const Route = createFileRoute('/_app/users/$userId/posts/$postId')({
  component: RouteComponent,
  loader: async ({ params: { postId, userId }, context }) => {
    const [postData, userData] = await Promise.all([
      context.queryClient.ensureQueryData(postQueries.byId(postId)),
      context.queryClient.ensureQueryData(userQueries.byId(userId)),
    ]);

    return {
      title: postData.title,
      userName: userData.name,
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
  errorComponent: PostErrorComponent,
  notFoundComponent: PostNotFoundComponent,
});

function RouteComponent() {
  const { postId, userId } = Route.useParams();
  const { data: post } = usePost({ id: postId });
  const { data: user } = useUser({ id: userId });

  return (
    <div className="space-y-4">
      <div>
        <Link
          className="text-primary hover:text-primary/80 font-medium"
          params={{ userId }}
          to="/users/$userId"
        >
          ← Back to {user.name}
        </Link>
      </div>

      <div className="space-y-2">
        <h4 className="text-xl font-bold underline">{post.title}</h4>
        <div className="text-sm">{post.body}</div>
      </div>
    </div>
  );
}
