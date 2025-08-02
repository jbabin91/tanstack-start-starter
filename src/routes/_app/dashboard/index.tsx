import { createFileRoute } from '@tanstack/react-router';

import { AccountDashboard } from '@/modules/accounts/components/account-dashboard';

export const Route = createFileRoute('/_app/dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <AccountDashboard />;
}
