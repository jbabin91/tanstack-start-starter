import {
  createFileRoute,
  Link,
  linkOptions,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { MailIcon, PaletteIcon } from 'lucide-react';

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
  { to: '/demo/email', label: 'Email', icon: MailIcon },
  { to: '/demo/colors', label: 'Colors', icon: PaletteIcon },
]);

function RouteComponent() {
  return (
    <SidebarProvider>
      <Sidebar className="mt-12" collapsible="icon" variant="floating">
        <div className="p-2">
          <SidebarTrigger />
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Demo Pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {demoLinks.map((link) => (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton asChild>
                      <Link
                        {...link}
                        activeProps={{ className: 'font-bold' }}
                        className="flex items-center"
                      >
                        <link.icon className="mr-2" />
                        <span className="sidebar-label group-data-[collapsible=icon]:hidden">
                          {link.label}
                        </span>
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
