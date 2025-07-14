import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

import { postQueries } from '@/modules/posts/api';
import { PostErrorComponent } from '@/modules/posts/components/post-error';
import { PostNotFoundComponent } from '@/modules/posts/components/post-not-found';
import { userQueries } from '@/modules/users/api';

export const Route = createFileRoute('/users/$userId/posts/$postId')({
  component: RouteComponent,
  loader: async ({ params: { postId, userId }, context }) => {
    const [postData, userData] = await Promise.all([
      context.queryClient.ensureQueryData(postQueries.byId(Number(postId))),
      context.queryClient.ensureQueryData(userQueries.byId(Number(userId))),
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
  const postQuery = useSuspenseQuery(postQueries.byId(Number(postId)));
  const userQuery = useSuspenseQuery(userQueries.byId(Number(userId)));

  return (
    <div className="space-y-4">
      <div>
        <Link
          className="text-primary hover:text-primary/80 font-medium"
          params={{ userId }}
          to="/users/$userId"
        >
          ← Back to {userQuery.data.name}
        </Link>
      </div>

      <div className="space-y-2">
        <h4 className="text-xl font-bold underline">{postQuery.data.title}</h4>
        <div className="text-sm">{postQuery.data.body}</div>
      </div>
    </div>
  );
}
