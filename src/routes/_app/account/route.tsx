import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/account')({
  component: AccountLayout,
});

function AccountLayout() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings.
        </p>
      </div>
      <Outlet />
    </div>
  );
}
