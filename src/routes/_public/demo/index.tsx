import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/demo/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-4 text-3xl font-bold">Welcome to the Demo Area</h1>
      <p className="text-muted-foreground mb-8">
        Explore interactive examples and feature showcases for this project. Use
        the sidebar to select a demo.
      </p>
    </div>
  );
}
