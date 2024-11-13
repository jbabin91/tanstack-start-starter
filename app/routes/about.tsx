import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

export const Route = createFileRoute('/about')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <React.Fragment>
      <div className="justify-center text-center">Hello /about!</div>
    </React.Fragment>
  );
}
