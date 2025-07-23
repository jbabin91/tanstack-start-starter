import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/users/$userId/posts')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex w-full max-w-5xl items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
