import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { userQueryOptions } from '@/modules/users/api';
import { UserErrorComponent } from '@/modules/users/components/user-error';
import { UserNotFoundComponent } from '@/modules/users/components/user-not-found';

export const Route = createFileRoute('/users/$userId/')({
  component: RouteComponent,
  loader: async ({ params: { userId }, context }) => {
    const data = await context.queryClient.ensureQueryData(
      userQueryOptions(Number(userId)),
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
  const userQuery = useSuspenseQuery(userQueryOptions(Number(userId)));

  return (
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
  );
}
