import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/signin' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
