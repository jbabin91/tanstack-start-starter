import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: {
          redirectUrl: location.href,
        },
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
