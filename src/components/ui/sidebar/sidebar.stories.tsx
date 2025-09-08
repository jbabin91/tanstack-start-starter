import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from './sidebar';

const meta = {
  title: 'UI/Layout/Sidebar',
  component: SidebarProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive sidebar component with collapsible states, mobile responsiveness, keyboard navigation, and customizable variants. Supports nested menus, actions, tooltips, and proper ARIA attributes. WCAG AA compliant.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultOpen: {
      description: 'Default open state',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    open: {
      description: 'Controlled open state',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onOpenChange: {
      description: 'Callback when open state changes',
      action: 'openChange',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
  },
} satisfies Meta<typeof SidebarProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultNavItems = [
  { title: 'Home', icon: Icons.home, url: '#' },
  { title: 'Inbox', icon: Icons.inbox, url: '#', badge: '12' },
  { title: 'Calendar', icon: Icons.calendar, url: '#' },
  { title: 'Search', icon: Icons.search, url: '#' },
  { title: 'Settings', icon: Icons.settings, url: '#' },
];

const projectItems = [
  { title: 'Design System', icon: Icons.folder, url: '#' },
  { title: 'Website Redesign', icon: Icons.folder, url: '#' },
  { title: 'Mobile App', icon: Icons.folder, url: '#' },
];

export const Default: Story = {
  args: {
    defaultOpen: true,
    onOpenChange: fn(),
  },
  render: (args) => (
    <SidebarProvider {...args}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
                <span className="text-primary-foreground text-sm font-bold">
                  A
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Acme Inc</p>
                <p className="text-muted-foreground text-xs">Team workspace</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {defaultNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mx-2 h-4" orientation="vertical" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl" />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Check basic navigation items
    expect(canvas.getByText('Acme Inc')).toBeVisible();
    expect(canvas.getByText('Navigation')).toBeVisible();
    expect(canvas.getByText('Home')).toBeVisible();
    expect(canvas.getByText('Inbox')).toBeVisible();
    expect(canvas.getByText('12')).toBeVisible(); // Badge

    // Check main content
    expect(canvas.getByText('Dashboard')).toBeVisible();

    // Test sidebar toggle - use specific trigger button
    const triggerButton = canvasElement.querySelector(
      '[data-sidebar="trigger"]',
    );
    expect(triggerButton).toBeVisible();

    await userEvent.click(triggerButton!);
    expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const CollapsibleExample: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="text-sm font-bold">A</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Acme Inc</span>
                <span className="text-muted-foreground truncate text-xs">
                  Enterprise
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {defaultNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupAction>
                <Icons.plus />
                <span className="sr-only">Add Project</span>
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  {projectItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction showOnHover>
                        <Icons.moreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      size="lg"
                    >
                      <Avatar className="size-8 rounded-lg">
                        <AvatarImage
                          alt="User Avatar"
                          src="https://github.com/shadcn.png"
                        />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">shadcn</span>
                        <span className="text-muted-foreground truncate text-xs">
                          m@example.com
                        </span>
                      </div>
                      <Icons.chevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="size-8 rounded-lg">
                          <AvatarImage
                            alt="User Avatar"
                            src="https://github.com/shadcn.png"
                          />
                          <AvatarFallback className="rounded-lg">
                            CN
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">shadcn</span>
                          <span className="text-muted-foreground truncate text-xs">
                            m@example.com
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Icons.user />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Icons.settings />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Icons.logOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mx-2 h-4" orientation="vertical" />
            <h1 className="text-lg font-semibold">Collapsible Sidebar</h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="bg-muted/50 min-h-[50vh] rounded-xl p-4">
              <h2 className="mb-2 text-lg font-medium">
                Icon Collapsible Sidebar
              </h2>
              <p className="text-muted-foreground text-sm">
                This sidebar can collapse to show only icons. Hover over icons
                when collapsed to see tooltips.
              </p>
            </div>
          </div>
        </SidebarInset>
        <SidebarRail />
      </div>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that tooltips are configured for collapsible state
    expect(canvas.getByText('Acme Inc')).toBeVisible();
    expect(canvas.getByText('Platform')).toBeVisible();
    expect(canvas.getByText('Projects')).toBeVisible();

    // Check user menu
    expect(canvas.getByText('shadcn')).toBeVisible();
    expect(canvas.getByText('m@example.com')).toBeVisible();

    // Test toggle functionality - use specific trigger button
    const triggerButton = canvasElement.querySelector(
      '[data-sidebar="trigger"]',
    );
    expect(triggerButton).toBeVisible();

    await userEvent.click(triggerButton!);

    // After collapse, the trigger should still be visible
    await waitFor(() => {
      const toggledButton = canvasElement.querySelector(
        '[data-sidebar="trigger"]',
      );
      expect(toggledButton).toBeVisible();
    });
  },
};

export const WithNestedMenus: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
                <span className="text-primary-foreground text-sm font-bold">
                  D
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Dashboard</p>
                <p className="text-muted-foreground text-xs">Admin panel</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Icons.home />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <Icons.user />
                          <span>Users</span>
                          <Icons.chevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>All Users</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton isActive>
                              <span>Active Users</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>User Roles</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <Icons.folder />
                          <span>Content</span>
                          <Icons.chevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>Posts</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>Pages</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton>
                              <span>Media Library</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Icons.settings />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mx-2 h-4" orientation="vertical" />
            <h1 className="text-lg font-semibold">Nested Menus</h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="bg-muted/50 min-h-[50vh] rounded-xl p-4">
              <h2 className="mb-2 text-lg font-medium">
                Sidebar with Nested Navigation
              </h2>
              <p className="text-muted-foreground text-sm">
                This sidebar demonstrates collapsible nested menus with proper
                indentation and active states.
              </p>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check main navigation - use getAllByText since there are multiple Dashboard elements
    const dashboardElements = canvas.getAllByText('Dashboard');
    expect(dashboardElements.length).toBeGreaterThan(0);
    expect(dashboardElements[0]).toBeVisible();
    expect(canvas.getByText('Users')).toBeVisible();
    expect(canvas.getByText('Content')).toBeVisible();
    expect(canvas.getByText('Settings')).toBeVisible();

    // Check nested menu (Users is expanded by default)
    expect(canvas.getByText('All Users')).toBeVisible();
    expect(canvas.getByText('Active Users')).toBeVisible();
    expect(canvas.getByText('User Roles')).toBeVisible();

    // Test collapsing the Content menu
    const contentButton = canvas.getByRole('button', { name: /Content/ });
    await userEvent.click(contentButton);

    await waitFor(() => {
      expect(canvas.getByText('Posts')).toBeVisible();
      expect(canvas.getByText('Pages')).toBeVisible();
      expect(canvas.getByText('Media Library')).toBeVisible();
    });
  },
};

export const WithSearch: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
                <span className="text-primary-foreground text-sm font-bold">
                  S
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Search Demo</p>
                <p className="text-muted-foreground text-xs">
                  With search input
                </p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Search</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarInput placeholder="Search..." />
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {defaultNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mx-2 h-4" orientation="vertical" />
            <h1 className="text-lg font-semibold">Search Sidebar</h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="bg-muted/50 min-h-[50vh] rounded-xl p-4">
              <h2 className="mb-2 text-lg font-medium">Sidebar with Search</h2>
              <p className="text-muted-foreground text-sm">
                This sidebar includes a search input and separator between
                sections.
              </p>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check search input
    const searchInput = canvas.getByPlaceholderText('Search...');
    expect(searchInput).toBeVisible();

    // Test search input interaction
    await userEvent.type(searchInput, 'test query');
    expect(searchInput).toHaveValue('test query');

    // Check navigation items
    expect(canvas.getByText('Navigation')).toBeVisible();
    expect(canvas.getByText('Home')).toBeVisible();
  },
};

export const LoadingState: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Loading...</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuSkeleton showIcon />
                  <SidebarMenuSkeleton />
                  <SidebarMenuSkeleton showIcon />
                  <SidebarMenuSkeleton />
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>More Items</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuSkeleton />
                  <SidebarMenuSkeleton showIcon />
                  <SidebarMenuSkeleton />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mx-2 h-4" orientation="vertical" />
            <h1 className="text-lg font-semibold">Loading State</h1>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="bg-muted/50 min-h-[50vh] rounded-xl p-4">
              <h2 className="mb-2 text-lg font-medium">Loading Skeleton</h2>
              <p className="text-muted-foreground text-sm">
                This demonstrates the loading state with skeleton placeholders.
              </p>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check loading state elements
    expect(canvas.getByText('Loading...')).toBeVisible();
    expect(canvas.getByText('More Items')).toBeVisible();
    expect(canvas.getByText('Loading State')).toBeVisible();

    // Check that loading content is present
    expect(canvas.getByText('Loading Skeleton')).toBeVisible();
  },
};

export const Controlled: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Sidebar is {isOpen ? 'open' : 'closed'}
          </span>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Close' : 'Open'} Sidebar
          </Button>
        </div>
        <SidebarProvider open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex h-96 w-full border">
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2 px-2">
                  <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
                    <span className="text-primary-foreground text-sm font-bold">
                      C
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Controlled</p>
                    <p className="text-muted-foreground text-xs">
                      External state
                    </p>
                  </div>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Menu</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {defaultNavItems.slice(0, 3).map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <div className="p-4">
                <h2 className="mb-2 text-lg font-medium">Controlled Sidebar</h2>
                <p className="text-muted-foreground text-sm">
                  This sidebar&apos;s state is controlled externally.
                </p>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check initial state
    expect(canvas.getByText('Sidebar is open')).toBeVisible();
    expect(canvas.getByText('Controlled')).toBeVisible();

    // Test external control
    const toggleButton = canvas.getByRole('button', {
      name: 'Close Sidebar',
    });
    await userEvent.click(toggleButton);

    expect(canvas.getByText('Sidebar is closed')).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Open Sidebar' })).toBeVisible();
  },
};
