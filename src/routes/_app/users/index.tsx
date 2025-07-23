import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/users/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="m-4">
      <h3 className="text-2xl font-semibold">Select a user</h3>
    </div>
  );
}
