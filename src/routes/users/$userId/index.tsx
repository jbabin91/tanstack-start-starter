import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

import { postQueries } from '@/modules/posts/api';
import { userQueries } from '@/modules/users/api';
import { UserErrorComponent } from '@/modules/users/components/user-error';
import { UserNotFoundComponent } from '@/modules/users/components/user-not-found';

export const Route = createFileRoute('/users/$userId/')({
  component: RouteComponent,
  loader: async ({ params: { userId }, context }) => {
    const data = await context.queryClient.ensureQueryData(
      userQueries.byId(Number(userId)),
    );

    // Also load the user's posts
    await context.queryClient.ensureQueryData(
      postQueries.byUserId(Number(userId)),
    );

    return {
      title: data.name,
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
  const userQuery = useSuspenseQuery(userQueries.byId(Number(userId)));
  const postsQuery = useSuspenseQuery(postQueries.byUserId(Number(userId)));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-xl font-bold underline">{userQuery.data.name}</h4>
        <div className="text-sm">
          <div>
            <strong>Username:</strong> {userQuery.data.username}
          </div>
          <div>
            <strong>Email:</strong> {userQuery.data.email}
          </div>
          <div>
            <strong>Phone:</strong> {userQuery.data.phone}
          </div>
          <div>
            <strong>Website:</strong> {userQuery.data.website}
          </div>
          <div>
            <strong>Company:</strong> {userQuery.data.company?.name ?? 'N/A'}
          </div>
          <div>
            <strong>Address:</strong>{' '}
            {userQuery.data.address
              ? `${userQuery.data.address.street}, ${userQuery.data.address.city}`
              : 'N/A'}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-lg font-semibold">Posts</h5>
        {postsQuery.data.length === 0 ? (
          <p className="text-muted-foreground text-sm">No posts found.</p>
        ) : (
          <div className="space-y-2">
            {postsQuery.data.map((post) => (
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
