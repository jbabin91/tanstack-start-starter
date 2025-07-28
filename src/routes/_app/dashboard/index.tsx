import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello &ldquo;/_app/dashboard/&rdquo;!</div>;
}
