import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/users/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Select a user.</div>;
}
