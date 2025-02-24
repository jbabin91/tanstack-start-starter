import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-1">
      Dashboard index page{' '}
      <pre className="bg-card text-card-foreground rounded-md border p-1">
        routes/dashboard/index.tsx
      </pre>
    </div>
  );
}
