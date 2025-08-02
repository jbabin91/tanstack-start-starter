import { createFileRoute } from '@tanstack/react-router';

import { SessionsManager } from '@/modules/accounts/components/sessions-manager';

export const Route = createFileRoute('/_app/account/sessions/')({
  component: SessionsPage,
});

function SessionsPage() {
  return <SessionsManager />;
}
