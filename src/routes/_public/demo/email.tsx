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
    <div className="mx-auto flex w-full max-w-xl items-center justify-center p-8">
      <DemoEmailForm />
    </div>
  );
}
