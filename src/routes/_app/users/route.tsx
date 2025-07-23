import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { userQueries } from '@/modules/users/api';
import { useUsers } from '@/modules/users/hooks/use-queries';

export const Route = createFileRoute('/_app/users')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(userQueries.all());
  },
  head: () => ({
    meta: [{ title: 'Users' }],
  }),
});

function RouteComponent() {
  const { data: users } = useUsers();

  return (
    <SidebarProvider>
      <Sidebar className="mt-12" variant="floating">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  ...users,
                  { id: 'i-do-not-exist', name: 'Non-existent User' },
                ].map((link) => (
                  <SidebarMenuItem key={link.id}>
                    <SidebarMenuButton asChild>
                      <Link
                        activeProps={{ className: 'font-bold' }}
                        className="flex items-center"
                        params={{ userId: link.id.toString() }}
                        to="/users/$userId"
                      >
                        {link.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
