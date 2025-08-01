import { createFileRoute, Link } from '@tanstack/react-router';

import {
  postQueries,
  usePostsByUserId,
} from '@/modules/posts/hooks/use-queries';
import { UserErrorComponent } from '@/modules/users/components/user-error';
import { UserNotFoundComponent } from '@/modules/users/components/user-not-found';
import { userQueries, useUser } from '@/modules/users/hooks/use-queries';

export const Route = createFileRoute('/_app/users/$userId/')({
  component: RouteComponent,
  loader: async ({ params: { userId }, context }) => {
    const [userData] = await Promise.all([
      context.queryClient.ensureQueryData(userQueries.byId(userId)),
      context.queryClient.ensureQueryData(postQueries.byUserId(userId)),
    ]);

    return {
      title: userData.name,
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
  errorComponent: UserErrorComponent,
  notFoundComponent: UserNotFoundComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const { data: user } = useUser(userId);
  const { data: posts } = usePostsByUserId(userId);

  return (
    <div className="m-4 space-y-6">
      <div className="space-y-2">
        <h4 className="text-xl font-bold underline">{user.name}</h4>
        <div className="text-sm">
          <div>
            <strong>Username:</strong> {user.username}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Phone:</strong> {user.phone}
          </div>
          <div>
            <strong>Website:</strong> {user.website}
          </div>
          <div>
            <strong>Address:</strong>{' '}
            {user.address
              ? (() => {
                  try {
                    const addr = JSON.parse(user.address);
                    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
                  } catch {
                    return 'N/A';
                  }
                })()
              : 'N/A'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-lg font-semibold">Posts</h5>
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No posts found.</p>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="rounded-lg border p-3">
                <h6 className="font-medium">{post.title}</h6>
                <p className="text-muted-foreground mt-1 text-sm">
                  {post.body.slice(0, 100)}...
                </p>
                <Link
                  className="text-primary hover:text-primary/80 mt-2 inline-block text-sm"
                  params={{
                    userId: userId,
                    postId: post.id.toString(),
                  }}
                  to="/users/$userId/posts/$postId"
                >
                  View Post →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
