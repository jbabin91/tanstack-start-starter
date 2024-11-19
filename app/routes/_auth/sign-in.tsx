import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/sign-in')({
  component: RouteComponent,
});

function RouteComponent() {
  return 'Hello /_auth/sign-in!';
}
