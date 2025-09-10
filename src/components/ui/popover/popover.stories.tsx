import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  title: 'UI/Overlays/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A popover component built on Radix UI that displays rich content in a portal overlay. Supports positioning, animations, and proper focus management. WCAG AA compliant.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex min-h-[400px] items-center justify-center">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    open: {
      description: 'Controlled open state',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
    },
    defaultOpen: {
      description: 'Default open state (uncontrolled)',
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
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onOpenChange: fn(),
  },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger>
        <Button variant="ghost">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="leading-none font-medium">Settings</h4>
          <p className="text-muted-foreground text-sm">
            Configure your preferences here.
          </p>
          <div className="pt-2">
            <Button size="sm">Save Changes</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Check trigger button exists
    const trigger = canvas.getByRole('button', { name: 'Open Popover' });
    expect(trigger).toBeVisible();

    // Open popover
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(args.onOpenChange).toHaveBeenCalledWith(true);
    });

    // Check popover content appears in portal
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeVisible();
    });

    expect(screen.getByText('Configure your preferences here.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeVisible();

    // Close popover by clicking outside
    await userEvent.click(document.body);

    await waitFor(() => {
      expect(args.onOpenChange).toHaveBeenCalledWith(false);
    });
  },
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost">
          <Icons.settings className="mr-2" />
          User Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Profile Settings</h4>
            <p className="text-muted-foreground text-sm">
              Update your profile information.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                className="col-span-2 h-8"
                defaultValue="John Doe"
                id="name"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                className="col-span-2 h-8"
                defaultValue="john@example.com"
                id="email"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="role">Role</Label>
              <Input
                className="col-span-2 h-8"
                defaultValue="Developer"
                id="role"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Open popover
    const trigger = canvas.getByRole('button', { name: 'User Settings' });
    await userEvent.click(trigger);

    // Check form elements in popover
    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeVisible();
    });

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const roleInput = screen.getByLabelText('Role');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(roleInput).toHaveValue('Developer');

    // Test form interaction
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Smith');
    expect(nameInput).toHaveValue('Jane Smith');

    // Check action buttons
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  },
};

export const Controlled: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            Popover is {isOpen ? 'open' : 'closed'}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Close' : 'Open'} Manually
          </Button>
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger>
            <Button>Toggle Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Controlled Popover</h4>
              <p className="text-muted-foreground text-sm">
                This popover&apos;s state is controlled externally.
              </p>
              <Button
                className="mt-2"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close from Inside
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Check initial state
    expect(canvas.getByText('Popover is closed')).toBeVisible();

    // Open via manual button
    const manualButton = canvas.getByRole('button', { name: 'Open Manually' });
    await userEvent.click(manualButton);

    expect(canvas.getByText('Popover is open')).toBeVisible();

    await waitFor(() => {
      expect(screen.getByText('Controlled Popover')).toBeVisible();
    });

    // Close from inside popover
    const closeButton = screen.getByRole('button', {
      name: 'Close from Inside',
    });
    await userEvent.click(closeButton);

    expect(canvas.getByText('Popover is closed')).toBeVisible();

    await waitFor(() => {
      expect(screen.queryByText('Controlled Popover')).not.toBeInTheDocument();
    });
  },
};

export const Positioning: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <div className="text-sm font-medium">Top</div>
        <Popover>
          <PopoverTrigger>
            <Button size="sm">Top</Button>
          </PopoverTrigger>
          <PopoverContent side="top">
            <p className="text-sm">Positioned above the trigger</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Bottom (Default)</div>
        <Popover>
          <PopoverTrigger>
            <Button size="sm">Bottom</Button>
          </PopoverTrigger>
          <PopoverContent>
            <p className="text-sm">Positioned below the trigger (default)</p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Right</div>
        <Popover>
          <PopoverTrigger>
            <Button size="sm">Right</Button>
          </PopoverTrigger>
          <PopoverContent side="right">
            <p className="text-sm">Positioned to the right of trigger</p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test top positioning
    const topButton = canvas.getByRole('button', { name: 'Top' });
    await userEvent.click(topButton);

    await waitFor(() => {
      expect(screen.getByText('Positioned above the trigger')).toBeVisible();
    });

    // Close by clicking outside
    await userEvent.click(document.body);

    await waitFor(() => {
      expect(
        screen.queryByText('Positioned above the trigger'),
      ).not.toBeInTheDocument();
    });

    // Test right positioning
    const rightButton = canvas.getByRole('button', { name: 'Right' });
    await userEvent.click(rightButton);

    await waitFor(() => {
      expect(
        screen.getByText('Positioned to the right of trigger'),
      ).toBeVisible();
    });
  },
};

export const WithCustomWidth: Story = {
  render: () => (
    <div className="space-y-4">
      <Popover>
        <PopoverTrigger>
          <Button variant="ghost">Narrow Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-40">
          <div className="space-y-2">
            <h4 className="font-medium">Narrow</h4>
            <p className="text-muted-foreground text-xs">
              This popover has a custom narrow width.
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger>
          <Button variant="ghost">Wide Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <div className="space-y-2">
            <h4 className="font-medium">Wide Popover</h4>
            <p className="text-muted-foreground text-sm">
              This popover has a custom wide width that can accommodate more
              content. It demonstrates how you can customize the width of
              popovers based on your needs.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
              <Button size="sm">Confirm</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test narrow popover
    const narrowButton = canvas.getByRole('button', { name: 'Narrow Popover' });
    await userEvent.click(narrowButton);

    await waitFor(() => {
      expect(screen.getByText('Narrow')).toBeVisible();
    });

    // Close it
    await userEvent.click(document.body);

    // Test wide popover
    const wideButton = canvas.getByRole('button', { name: 'Wide Popover' });
    await userEvent.click(wideButton);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Wide Popover' }),
      ).toBeVisible();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeVisible();
    });
  },
};

export const HelpPopover: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="username">Username</Label>
        <Popover>
          <PopoverTrigger>
            <Button aria-label="Username help" size="sm" variant="ghost">
              <Icons.info />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Username Guidelines</h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>Must be 3-20 characters long</li>
                <li>Can contain letters, numbers, and underscores</li>
                <li>Must start with a letter</li>
                <li>Cannot contain spaces or special characters</li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Input id="username" placeholder="Enter username" />

      <div className="flex items-center gap-2">
        <Label htmlFor="password">Password</Label>
        <Popover>
          <PopoverTrigger>
            <Button aria-label="Password help" size="sm" variant="ghost">
              <Icons.info />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Password Requirements</h4>
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>At least 8 characters long</li>
                <li>Must contain at least one uppercase letter</li>
                <li>Must contain at least one lowercase letter</li>
                <li>Must contain at least one number</li>
                <li>Must contain at least one special character</li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Input id="password" placeholder="Enter password" type="password" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test username help
    const usernameHelp = canvas.getByRole('button', { name: 'Username help' });
    await userEvent.click(usernameHelp);

    await waitFor(() => {
      expect(screen.getByText('Username Guidelines')).toBeVisible();
      expect(screen.getByText('Must be 3-20 characters long')).toBeVisible();
    });

    // Close and test password help
    await userEvent.click(document.body);

    const passwordHelp = canvas.getByRole('button', { name: 'Password help' });
    await userEvent.click(passwordHelp);

    await waitFor(() => {
      expect(screen.getByText('Password Requirements')).toBeVisible();
      expect(screen.getByText('At least 8 characters long')).toBeVisible();
    });
  },
};

export const WithArrow: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-8">
      <div className="space-y-2 text-center">
        <div className="text-sm font-medium">Bottom Arrow (Default)</div>
        <Popover>
          <PopoverTrigger>
            <Button variant="outlined">Bottom Arrow</Button>
          </PopoverTrigger>
          <PopoverContent showArrow>
            <div className="space-y-2">
              <h4 className="font-medium">With Arrow</h4>
              <p className="text-muted-foreground text-sm">
                This popover has an arrow pointing to the trigger.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2 text-center">
        <div className="text-sm font-medium">Top Arrow</div>
        <Popover>
          <PopoverTrigger>
            <Button variant="outlined">Top Arrow</Button>
          </PopoverTrigger>
          <PopoverContent showArrow side="top">
            <div className="space-y-2">
              <h4 className="font-medium">Arrow Above</h4>
              <p className="text-muted-foreground text-sm">
                Arrow points downward when popover is above trigger.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test bottom arrow
    const bottomButton = canvas.getByRole('button', { name: 'Bottom Arrow' });
    await userEvent.click(bottomButton);

    await waitFor(() => {
      expect(screen.getByText('With Arrow')).toBeVisible();
    });

    // Close bottom popover
    await userEvent.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText('With Arrow')).not.toBeInTheDocument();
    });

    // Test top arrow
    const topButton = canvas.getByRole('button', { name: 'Top Arrow' });
    await userEvent.click(topButton);

    await waitFor(() => {
      expect(screen.getByText('Arrow Above')).toBeVisible();
    });
  },
};
