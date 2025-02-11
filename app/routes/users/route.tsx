import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

import { usersQueryOptions } from '~/utils/users';

export const Route = createFileRoute('/users')({
  component: UsersComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersQueryOptions());
  },
});

function UsersComponent() {
  const usersQuery = useSuspenseQuery(usersQueryOptions());

  return (
    <div className="flex gap-2 p-2">
      <ul className="list-disc pl-4">
        {[
          ...usersQuery.data,
          { email: '', id: 'i-do-not-exist', name: 'Non-existent User' },
        ].map((user) => {
          return (
            <li key={user.id} className="whitespace-nowrap">
              <Link
                activeProps={{ className: 'text-black font-bold' }}
                className="block py-1 text-blue-800 hover:text-blue-600"
                params={{
                  userId: String(user.id),
                }}
                to="/users/$userId"
              >
                <div>{user.name}</div>
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
