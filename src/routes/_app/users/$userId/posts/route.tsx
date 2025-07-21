import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/users/$userId/posts')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
