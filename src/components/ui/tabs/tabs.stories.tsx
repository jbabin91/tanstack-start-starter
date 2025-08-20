import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      description:
        'The value of the tab that should be active when initially rendered.',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      description: 'The controlled value of the tab to activate.',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    onValueChange: {
      description: 'Event handler called when the value changes.',
      action: 'valueChanged',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    orientation: {
      description: 'The orientation of the component.',
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'horizontal' },
      },
    },
    dir: {
      description: 'The reading direction of the tabs.',
      control: 'select',
      options: ['ltr', 'rtl'],
      table: {
        type: { summary: 'string' },
      },
    },
    activationMode: {
      description: 'Whether a tab is activated automatically or manually.',
      control: 'select',
      options: ['automatic', 'manual'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'automatic' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTabs: Story = {
  args: {
    defaultValue: 'account',
  },
  render: (args) => (
    <Tabs className="w-[400px]" {...args}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you&apos;re
              done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input defaultValue="Pedro Duarte" id="name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input defaultValue="@peduarte" id="username" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged
              out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const ThreeTabs: Story = {
  args: {
    defaultValue: 'overview',
  },
  render: (args) => (
    <Tabs className="w-[500px]" {...args}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent className="space-y-4" value="overview">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Project Overview</h3>
          <p className="text-muted-foreground mt-2">
            Get an overview of your project performance and key metrics.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded border p-3">
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-muted-foreground text-sm">Total Users</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-2xl font-bold">$12,345</div>
              <div className="text-muted-foreground text-sm">Revenue</div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent className="space-y-4" value="analytics">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Analytics Dashboard</h3>
          <p className="text-muted-foreground mt-2">
            Detailed analytics and insights about user behavior.
          </p>
          <div className="mt-4">
            <div className="rounded border p-4">
              <div className="mb-2 text-sm font-medium">Page Views</div>
              <div className="bg-muted h-2 w-full rounded">
                <div className="bg-primary h-2 w-3/4 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent className="space-y-4" value="reports">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium">Reports</h3>
          <p className="text-muted-foreground mt-2">
            Generate and download various reports about your project.
          </p>
          <div className="mt-4 space-y-2">
            <Button className="w-full" variant="outlined">
              Download User Report
            </Button>
            <Button className="w-full" variant="outlined">
              Download Revenue Report
            </Button>
            <Button className="w-full" variant="outlined">
              Download Analytics Report
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example with three tabs showing different content types.',
      },
    },
  },
};

export const VerticalTabs: Story = {
  args: {
    defaultValue: 'profile',
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="w-[600px]">
      <Tabs className="flex gap-4" {...args}>
        <TabsList className="flex h-auto flex-col">
          <TabsTrigger className="w-full justify-start" value="profile">
            Profile
          </TabsTrigger>
          <TabsTrigger className="w-full justify-start" value="account">
            Account
          </TabsTrigger>
          <TabsTrigger className="w-full justify-start" value="appearance">
            Appearance
          </TabsTrigger>
          <TabsTrigger className="w-full justify-start" value="notifications">
            Notifications
          </TabsTrigger>
        </TabsList>
        <div className="flex-1">
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  This is how others will see you on the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input defaultValue="John Doe" id="display-name" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bio">Bio</Label>
                  <Input defaultValue="I own a computer." id="bio" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and set e-mail preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input defaultValue="john@example.com" id="email" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the appearance of the app. Automatically switch
                  between day and night themes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outlined">
                      Light
                    </Button>
                    <Button size="sm" variant="outlined">
                      Dark
                    </Button>
                    <Button size="sm" variant="outlined">
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Email Notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Choose what you want to be notified about.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical orientation tabs for sidebar-style navigation.',
      },
    },
  },
};

export const InteractiveTabs: Story = {
  args: {
    defaultValue: 'tab1',
  },
  render: (args) => (
    <Tabs className="w-[400px]" {...args}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">First Tab Content</h3>
          <p className="text-muted-foreground mt-2">
            This is the content of the first tab.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Second Tab Content</h3>
          <p className="text-muted-foreground mt-2">
            This is the content of the second tab.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Third Tab Content</h3>
          <p className="text-muted-foreground mt-2">
            This is the content of the third tab.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Verify initial state using semantic queries
    const firstTab = canvas.getByRole('tab', { name: 'Tab 1' });
    const secondTab = canvas.getByRole('tab', { name: 'Tab 2' });
    const thirdTab = canvas.getByRole('tab', { name: 'Tab 3' });

    const firstContent = canvas.getByText('First Tab Content');
    // First tab should be active initially
    await expect(firstTab).toHaveAttribute('data-state', 'active');
    await expect(firstContent).toBeVisible();

    // Other content should not be visible (either null or hidden)
    const secondContent = canvas.queryByText('Second Tab Content');
    const thirdContent = canvas.queryByText('Third Tab Content');
    if (secondContent) {
      expect(secondContent).not.toBeVisible();
    }
    if (thirdContent) {
      expect(thirdContent).not.toBeVisible();
    }

    // Click second tab
    await userEvent.click(secondTab);

    // Verify second tab is now active
    await expect(secondTab).toHaveAttribute('data-state', 'active');
    await expect(firstTab).toHaveAttribute('data-state', 'inactive');

    // Verify content switched
    await waitFor(() => {
      const newSecondContent = canvas.getByText('Second Tab Content');
      const newFirstContent = canvas.queryByText('First Tab Content');

      expect(newSecondContent).toBeVisible();
      if (newFirstContent) {
        expect(newFirstContent).not.toBeVisible();
      }
    });

    // Click third tab
    await userEvent.click(thirdTab);

    // Verify third tab is now active
    await expect(thirdTab).toHaveAttribute('data-state', 'active');
    await expect(secondTab).toHaveAttribute('data-state', 'inactive');

    // Verify content switched to third
    await waitFor(() => {
      const newThirdContent = canvas.getByText('Third Tab Content');
      expect(newThirdContent).toBeVisible();
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive tabs example with comprehensive testing of tab switching behavior.',
      },
    },
  },
};

export const SettingsForm: Story = {
  args: {
    defaultValue: 'general',
  },
  render: (args) => (
    <div className="w-[600px]">
      <h2 className="mb-4 text-2xl font-bold">Settings</h2>
      <Tabs {...args}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent className="space-y-4" value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your general account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input defaultValue="John" id="firstName" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input defaultValue="Doe" id="lastName" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  defaultValue="john.doe@example.com"
                  id="email"
                  type="email"
                />
              </div>
              <div className="flex justify-end">
                <Button color="primary">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="space-y-4" value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outlined">Cancel</Button>
                <Button color="primary">Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your account with third-party services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Integration settings will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Advanced configuration options for power users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced settings will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ),
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story:
          'Real-world example of tabs used in a settings form with multiple sections.',
      },
    },
  },
};
