import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Select a user.</div>;
}
