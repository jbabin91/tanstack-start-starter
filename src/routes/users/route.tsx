import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

import { usersQueryOptions } from '@/modules/users/api';

export const Route = createFileRoute('/users')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersQueryOptions());
  },
  head: () => ({
    meta: [{ title: 'Users' }],
  }),
});

function RouteComponent() {
  const usersQuery = useSuspenseQuery(usersQueryOptions());

  return (
    <div className="flex gap-2 p-2">
      <ul className="w-64 flex-shrink-0 pl-4">
        {[
          ...usersQuery.data,
          { id: 'i-do-not-exist', name: 'Non-existent User' },
        ].map((user) => {
          return (
            <li key={user.id} className="whitespace-nowrap">
              <div className="flex flex-col gap-1">
                <Link
                  activeProps={{ className: 'text-foreground font-bold' }}
                  className="text-primary hover:text-primary/80 block py-1"
                  params={{
                    userId: user.id.toString(),
                  }}
                  to="/users/$userId"
                >
                  <div>{user.name.slice(0, 20)}</div>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
