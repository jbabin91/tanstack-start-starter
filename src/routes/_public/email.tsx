import { createFileRoute, redirect } from '@tanstack/react-router';

import { DemoEmailForm } from '@/modules/email/components/demo-email-form';

export const Route = createFileRoute('/_public/email')({
  component: RouteComponent,
  beforeLoad: () => {
    // Redirect to home in production
    if (import.meta.env.PROD) {
      throw redirect({ to: '/' });
    }
  },
  head: () => ({
    meta: [{ title: 'Email Form Demo - Dev Only' }],
  }),
});

function RouteComponent() {
  return (
    <div className="mt-4 flex h-full w-full items-center justify-center">
      <DemoEmailForm />
    </div>
  );
}
