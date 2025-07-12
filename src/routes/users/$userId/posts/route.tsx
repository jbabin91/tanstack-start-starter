import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/users/$userId/posts')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
