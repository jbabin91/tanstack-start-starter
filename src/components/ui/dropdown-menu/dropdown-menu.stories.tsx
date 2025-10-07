import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu/dropdown-menu';
import { isElementVisible } from '@/test/utils';

const meta: Meta<typeof DropdownMenu> = {
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A dropdown menu component built on top of Radix UI primitives with keyboard navigation, focus management, and portal rendering.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Navigation/Dropdown Menu',
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {},
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outlined">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>
          <Icons.user className="mr-2" />
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icons.settings className="mr-2" />
          Settings
          <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icons.bell className="mr-2" />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Icons.shield className="mr-2" />
          Security (Disabled)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="error">
          <Icons.ban className="mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  args: {},
  render: () => {
    const [showStatusBar, setShowStatusBar] = React.useState(true);
    const [showActivityBar, setShowActivityBar] = React.useState(false);
    const [showPanel, setShowPanel] = React.useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outlined">View Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>UI Elements</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showStatusBar}
            onCheckedChange={(checked) => setShowStatusBar(checked)}
          >
            Status Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showActivityBar}
            onCheckedChange={(checked) => setShowActivityBar(checked)}
          >
            Activity Bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={showPanel}
            onCheckedChange={(checked) => setShowPanel(checked)}
          >
            Panel
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithRadioGroup: Story = {
  args: {},
  render: () => {
    const [position, setPosition] = React.useState('bottom');

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outlined">Panel Position</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Position</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithGroups: Story = {
  args: {},
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outlined">Menu Groups</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icons.user className="mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icons.settings className="mr-2" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icons.users className="mr-2" />
            Team
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icons.shield className="mr-2" />
            Invite users
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icons.bell className="mr-2" />
          Support
        </DropdownMenuItem>
        <DropdownMenuItem variant="error">
          <Icons.ban className="mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithSubmenus: Story = {
  args: {},
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outlined">File Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>
          <Icons.file className="mr-2" />
          New File
          <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icons.file className="mr-2" />
          Open File
          <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icons.file className="mr-2" />
            Recent Files
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              <Icons.fileText className="mr-2" />
              document.txt
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.fileText className="mr-2" />
              notes.md
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.fileText className="mr-2" />
              config.json
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icons.download className="mr-2" />
              More...
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icons.download className="mr-2" />
          Save
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icons.download className="mr-2" />
          Export
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const UserProfileMenu: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Find the user profile button
    const profileButton = canvas.getByRole('button');
    expect(profileButton).toBeVisible();

    // Click to open the dropdown
    await userEvent.click(profileButton);

    // Wait for dropdown to appear in portal
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });

    // Check user info is visible
    expect(screen.getByText('John Doe')).toBeVisible();
    expect(screen.getByText('john.doe@example.com')).toBeVisible();

    // Check menu items
    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /settings/i })).toBeVisible();
    expect(
      screen.getByRole('menuitem', { name: /notifications/i }),
    ).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /team/i })).toBeVisible();
    expect(
      screen.getByRole('menuitem', { name: /invite users/i }),
    ).toBeVisible();
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeVisible();

    // Check keyboard shortcuts are displayed
    expect(screen.getByText('⇧⌘P')).toBeVisible();
    expect(screen.getByText('⌘,')).toBeVisible();
    expect(screen.getByText('⇧⌘Q')).toBeVisible();

    // Click on profile item
    await userEvent.click(screen.getByRole('menuitem', { name: /profile/i }));

    // Menu should close after clicking
    await waitFor(() => {
      const menu = screen.queryByRole('menu');
      expect(menu).toSatisfy(
        (el: HTMLElement | null) => el === null || !isElementVisible(el),
      );
    });
  },
  render: () => (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="relative size-8 rounded-full p-0" variant="ghost">
            <Avatar className="size-8">
              <AvatarImage alt="@johndoe" src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">John Doe</p>
              <p className="text-muted-foreground text-xs leading-none">
                john.doe@example.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Icons.user className="mr-2" />
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.settings className="mr-2" />
              Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.bell className="mr-2" />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Icons.shield className="mr-2" />
            Team
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icons.users className="mr-2" />
            Invite users
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="error">
            <Icons.ban className="mr-2" />
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const ActionMenu: Story = {
  args: {},
  render: () => (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Project: React Dashboard</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost">
            <Icons.moreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem>
            <Icons.eye className="mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icons.edit className="mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icons.download className="mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Icons.download className="mr-2" />
            Export
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icons.shield className="mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="error">
            <Icons.ban className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const TableRowActions: Story = {
  args: {},
  render: () => (
    <div className="w-full">
      <div className="flex items-center justify-between rounded-md border p-4">
        <div>
          <h4 className="font-semibold">Task Item #1234</h4>
          <p className="text-muted-foreground text-sm">
            Complete user authentication feature
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              <Icons.moreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <Icons.edit className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.download className="mr-2" />
              Clone
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icons.activity className="mr-2" />
                Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Icons.circle className="mr-2" />
                  Todo
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icons.activity className="mr-2" />
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icons.checkCircle className="mr-2" />
                  Done
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="error">
              <Icons.ban className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Open dropdown menu
    await userEvent.click(
      canvas.getByRole('button', { name: 'Interactive Menu' }),
    );

    // Wait for portal content to appear
    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });

    // Verify menu structure
    expect(screen.getByText('Appearance')).toBeVisible();
    expect(screen.getByText('Theme')).toBeVisible();

    // Test checkbox items
    const statusBarCheckbox = screen.getByRole('menuitemcheckbox', {
      name: 'Status Bar',
    });
    expect(statusBarCheckbox).toHaveAttribute('aria-checked', 'true');

    const activityBarCheckbox = screen.getByRole('menuitemcheckbox', {
      name: 'Activity Bar',
    });
    expect(activityBarCheckbox).toHaveAttribute('aria-checked', 'false');

    // Toggle activity bar
    await userEvent.click(activityBarCheckbox);
    await waitFor(() => {
      expect(canvas.getByText('Activity Bar: Visible')).toBeVisible();
    });

    // Test radio group
    const darkTheme = screen.getByRole('menuitemradio', { name: 'Dark' });
    expect(darkTheme).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(darkTheme);
    await waitFor(() => {
      expect(canvas.getByText('Theme: dark')).toBeVisible();
    });

    // Test submenu
    const moreToolsSubmenu = screen.getByText('More Tools');
    await userEvent.hover(moreToolsSubmenu);

    await waitFor(() => {
      expect(screen.getByText('Color Picker')).toBeVisible();
    });

    // Verify disabled submenu item
    const extensionsItem = screen.getByText('Extensions (Coming Soon)');
    expect(extensionsItem.closest('[role="menuitem"]')).toHaveAttribute(
      'data-disabled',
    );

    // Test keyboard shortcut display
    expect(screen.getByText('⌘,')).toBeVisible();

    // Close menu by clicking outside
    await userEvent.click(canvas.getByText('Status Bar: Visible'));

    await waitFor(() => {
      const menu: HTMLElement | null = screen.queryByRole('menu');
      expect(menu).toSatisfy(
        (el: HTMLElement | null) => el === null || !isElementVisible(el),
      );
    });

    // Menu interaction complete
  },
  render: () => {
    const [showStatusBar, setShowStatusBar] = React.useState(true);
    const [showActivityBar, setShowActivityBar] = React.useState(false);
    const [theme, setTheme] = React.useState('light');

    return (
      <div className="space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outlined">Interactive Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem
                checked={showStatusBar}
                onCheckedChange={(checked) => setShowStatusBar(checked)}
              >
                Status Bar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showActivityBar}
                onCheckedChange={(checked) => setShowActivityBar(checked)}
              >
                Activity Bar
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Icons.settings className="mr-2" />
                More Tools
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Icons.palette className="mr-2" />
                  Color Picker
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Icons.zap className="mr-2" />
                  Extensions (Coming Soon)
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icons.bell className="mr-2" />
              Preferences
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="text-muted-foreground space-y-1 text-sm">
          <div>Status Bar: {showStatusBar ? 'Visible' : 'Hidden'}</div>
          <div>Activity Bar: {showActivityBar ? 'Visible' : 'Hidden'}</div>
          <div>Theme: {theme}</div>
        </div>
      </div>
    );
  },
};
