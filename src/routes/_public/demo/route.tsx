import {
  createFileRoute,
  Link,
  linkOptions,
  Outlet,
  redirect,
} from '@tanstack/react-router';

import { Icons } from '@/components/icons';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export const Route = createFileRoute('/_public/demo')({
  component: RouteComponent,
  beforeLoad: () => {
    // Redirect to home in production
    if (import.meta.env.PROD) {
      throw redirect({ to: '/' });
    }
  },
  head: () => ({
    meta: [{ title: 'Demo Area - Dev Only' }],
  }),
});

const demoLinks = linkOptions([
  { to: '/demo/email', label: 'Email', icon: Icons.mail },
  { to: '/demo/colors', label: 'Colors', icon: Icons.palette },
]);

function RouteComponent() {
  return (
    <SidebarProvider>
      <Sidebar className="mt-14" collapsible="icon" variant="floating">
        <div className="p-2">
          <SidebarTrigger />
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Demo Pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {demoLinks.map((link) => {
                  const { icon: Icon, label, ...linkProps } = link;
                  return (
                    <SidebarMenuItem key={link.to}>
                      <SidebarMenuButton asChild>
                        <Link
                          {...linkProps}
                          activeProps={{ className: 'font-bold' }}
                          className="flex items-center"
                        >
                          <Icon className="mr-2" />
                          <span className="sidebar-label group-data-[collapsible=icon]:hidden">
                            {label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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
