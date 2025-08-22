import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  title: 'UI/Overlays/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A sheet component built on Radix UI that slides in from the edge of the screen. Similar to a drawer or side panel. Supports four different sides and animations. WCAG AA compliant.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center">
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
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onOpenChange: fn(),
  },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="ghost">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="name">
              Name
            </Label>
            <Input
              className="col-span-3"
              defaultValue="Pedro Duarte"
              id="name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="username">
              Username
            </Label>
            <Input
              className="col-span-3"
              defaultValue="@peduarte"
              id="username"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Check trigger button
    const trigger = canvas.getByRole('button', { name: 'Open Sheet' });
    expect(trigger).toBeVisible();

    // Open sheet
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(args.onOpenChange).toHaveBeenCalledWith(true);
    });

    // Check sheet content appears in portal
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeVisible();
    });

    const dialog = screen.getByRole('dialog');

    // Check sheet structure
    expect(within(dialog).getByText('Edit Profile')).toBeVisible();
    expect(
      within(dialog).getByText(/Make changes to your profile/),
    ).toBeVisible();

    // Check form elements
    const nameInput = within(dialog).getByDisplayValue('Pedro Duarte');
    const usernameInput = within(dialog).getByDisplayValue('@peduarte');
    expect(nameInput).toBeVisible();
    expect(usernameInput).toBeVisible();

    // Test save button
    const saveButton = within(dialog).getByRole('button', {
      name: 'Save changes',
    });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(args.onOpenChange).toHaveBeenCalledWith(false);
    });
  },
};

export const FromLeft: Story = {
  args: {
    onOpenChange: fn(),
  },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Icons.panelLeft className="mr-2 h-4 w-4" />
          Left Sheet
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Navigate through the application sections.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <nav className="space-y-2">
            {[
              { name: 'Dashboard', icon: Icons.activity },
              { name: 'Projects', icon: Icons.file },
              { name: 'Settings', icon: Icons.settings },
              { name: 'Profile', icon: Icons.user },
              { name: 'Help', icon: Icons.info },
            ].map((item) => (
              <Button
                key={item.name}
                className="w-full justify-start"
                variant="ghost"
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    const trigger = canvas.getByRole('button', { name: 'Left Sheet' });
    await userEvent.click(trigger);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(within(dialog).getByText('Navigation Menu')).toBeVisible();
      expect(
        within(dialog).getByRole('button', { name: 'Dashboard' }),
      ).toBeVisible();
    });
  },
};

export const FromTop: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Icons.chevronDown className="mr-2 h-4 w-4" />
          Top Sheet
        </Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Your recent notifications and updates.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3 py-4">
          {[
            {
              title: 'New message received',
              time: '2 minutes ago',
              type: 'message',
            },
            {
              title: 'Project updated',
              time: '1 hour ago',
              type: 'update',
            },
            {
              title: 'Meeting reminder',
              time: '3 hours ago',
              type: 'calendar',
            },
          ].map((notification, index) => (
            <div
              key={index}
              className="hover:bg-accent/50 flex items-start gap-3 rounded-md p-3"
            >
              <div className="bg-primary mt-2 h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-muted-foreground text-xs">
                  {notification.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <SheetFooter>
          <Button size="sm" variant="ghost">
            Mark all as read
          </Button>
          <Button size="sm">View all notifications</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    const trigger = canvas.getByRole('button', { name: 'Top Sheet' });
    await userEvent.click(trigger);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(within(dialog).getByText('Notifications')).toBeVisible();
      expect(within(dialog).getByText('New message received')).toBeVisible();
    });
  },
};

export const FromBottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Icons.chevronUp className="mr-2 h-4 w-4" />
          Bottom Sheet
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            Perform quick actions without leaving this page.
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {[
            { name: 'Create Post', icon: Icons.edit },
            { name: 'Upload File', icon: Icons.download },
            { name: 'Share Link', icon: Icons.externalLink },
            { name: 'Send Message', icon: Icons.mail },
          ].map((action) => (
            <Button
              key={action.name}
              className="flex h-16 flex-col gap-2"
              variant="ghost"
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.name}</span>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    const trigger = canvas.getByRole('button', { name: 'Bottom Sheet' });
    await userEvent.click(trigger);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeVisible();
      expect(within(dialog).getByText('Quick Actions')).toBeVisible();
      expect(
        within(dialog).getByRole('button', { name: 'Create Post' }),
      ).toBeVisible();
    });
  },
};

export const Controlled: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm">Sheet is {isOpen ? 'open' : 'closed'}</span>
          <Button size="sm" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Close' : 'Open'} Sheet
          </Button>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>Toggle Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Controlled Sheet</SheetTitle>
              <SheetDescription>
                This sheet&apos;s state is controlled externally.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <p className="text-muted-foreground text-sm">
                You can control this sheet from the buttons above or close it
                using the X button.
              </p>
            </div>
            <SheetFooter>
              <Button onClick={() => setIsOpen(false)}>
                Close from Inside
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Check initial state
    expect(canvas.getByText('Sheet is closed')).toBeVisible();

    // Open via external button
    const externalButton = canvas.getByRole('button', { name: 'Open Sheet' });
    await userEvent.click(externalButton);

    expect(canvas.getByText('Sheet is open')).toBeVisible();

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeVisible();
    });

    // Close from inside
    const dialog = screen.getByRole('dialog');
    const closeButton = within(dialog).getByRole('button', {
      name: 'Close from Inside',
    });
    await userEvent.click(closeButton);

    expect(canvas.getByText('Sheet is closed')).toBeVisible();
  },
};

export const WithForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Icons.edit className="mr-2 h-4 w-4" />
          Contact Form
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[400px]">
        <SheetHeader>
          <SheetTitle>Contact Us</SheetTitle>
          <SheetDescription>
            Send us a message and we&apos;ll get back to you as soon as
            possible.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="your@email.com" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your inquiry"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              className="min-h-[120px]"
              id="message"
              placeholder="Tell us more about your inquiry..."
            />
          </div>
        </div>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="ghost">Cancel</Button>
          </SheetClose>
          <Button>Send Message</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    const trigger = canvas.getByRole('button', { name: 'Contact Form' });
    await userEvent.click(trigger);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeVisible();
    });

    const dialog = screen.getByRole('dialog');

    // Check form elements
    const emailInput = within(dialog).getByLabelText('Email');
    const subjectInput = within(dialog).getByLabelText('Subject');
    const messageTextarea = within(dialog).getByLabelText('Message');

    expect(emailInput).toBeVisible();
    expect(subjectInput).toBeVisible();
    expect(messageTextarea).toBeVisible();

    // Test form interaction
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(subjectInput, 'Test Subject');
    await userEvent.type(messageTextarea, 'This is a test message');

    expect(emailInput).toHaveValue('test@example.com');
    expect(subjectInput).toHaveValue('Test Subject');
    expect(messageTextarea).toHaveValue('This is a test message');
  },
};

export const WithScrollableContent: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Icons.fileText className="mr-2 h-4 w-4" />
          Terms & Conditions
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Terms and Conditions</SheetTitle>
          <SheetDescription>
            Please read our terms and conditions carefully.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-sm font-medium">Section {i + 1}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur.
              </p>
            </div>
          ))}
        </div>
        <SheetFooter>
          <div className="flex items-center space-x-2">
            <input className="rounded" id="agree" type="checkbox" />
            <Label className="text-sm" htmlFor="agree">
              I agree to the terms and conditions
            </Label>
          </div>
          <SheetClose asChild>
            <Button>Accept</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    const trigger = canvas.getByRole('button', { name: 'Terms & Conditions' });
    await userEvent.click(trigger);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeVisible();
    });

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Terms and Conditions')).toBeVisible();
    expect(within(dialog).getByText('Section 1')).toBeVisible();
    expect(within(dialog).getByText('Section 2')).toBeVisible();

    // Check checkbox and accept button
    const checkbox = within(dialog).getByLabelText(
      'I agree to the terms and conditions',
    );
    const acceptButton = within(dialog).getByRole('button', { name: 'Accept' });

    expect(checkbox).toBeVisible();
    expect(acceptButton).toBeVisible();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  },
};
