import { createFileRoute } from '@tanstack/react-router';

import { DemoEmailForm } from '@/modules/email/components/demo-email-form';

export const Route = createFileRoute('/_public/form-demo')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mt-4 flex h-full w-full items-center justify-center">
      <DemoEmailForm />
    </div>
  );
}
