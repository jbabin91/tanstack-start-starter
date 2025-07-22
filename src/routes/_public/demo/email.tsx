import { createFileRoute } from '@tanstack/react-router';

import { DemoEmailForm } from '@/modules/email/components/demo-email-form';

export const Route = createFileRoute('/_public/demo/email')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: 'Email Form Demo - Dev Only' }],
  }),
});

function RouteComponent() {
  return (
    <div className="mt-4 flex w-full items-center justify-center">
      <DemoEmailForm />
    </div>
  );
}
