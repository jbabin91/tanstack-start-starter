import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isElementVisible } from '@/test/utils';

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  decorators: [
    (Story) => (
      <div className="flex size-96 items-center justify-center">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A drawer component built on top of Vaul. Slides in from the edge of the screen to reveal additional content. Supports multiple directions and responsive behavior.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Navigation/Drawer',
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Basic drawer that slides up from the bottom of the screen.',
      },
    },
  },
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outlined">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>
            This is a basic drawer component. You can put any content here.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p className="text-muted-foreground text-sm">
            This is the main content area of the drawer. You can add any
            components or content here.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outlined">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WithForm: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Drawer containing a form for user input with validation.',
      },
    },
  },
  render: function WithFormStory() {
    const [formData, setFormData] = useState({
      email: '',
      message: '',
      name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
    };

    const handleInputChange =
      (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };

    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button>
            <Icons.plus className="mr-2" />
            Add Contact
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Contact</DrawerTitle>
            <DrawerDescription>
              Fill in the details to add a new contact to your list.
            </DrawerDescription>
          </DrawerHeader>
          <form className="space-y-4 p-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleInputChange('name')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                id="message"
                placeholder="Enter a message"
                value={formData.message}
                onChange={handleInputChange('message')}
              />
            </div>
          </form>
          <DrawerFooter>
            <Button type="submit" onClick={handleSubmit}>
              <Icons.plus className="mr-2" />
              Add Contact
            </Button>
            <DrawerClose asChild>
              <Button variant="outlined">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
};

export const FromTop: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Drawer that slides down from the top of the screen.',
      },
    },
  },
  render: () => (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button variant="outlined">Open from Top</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Top Drawer</DrawerTitle>
          <DrawerDescription>
            This drawer slides down from the top of the screen.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium">Notification Settings</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Configure how you receive notifications.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <Button size="sm" variant="outlined">
                  Toggle
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push notifications</span>
                <Button size="sm" variant="outlined">
                  Toggle
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const FromLeft: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Drawer that slides in from the left as a navigation sidebar.',
      },
    },
  },
  render: () => (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outlined">
          <Icons.panelLeft className="mr-2" />
          Open Sidebar
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Quick access to main sections.</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <a
              className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              href="/dashboard"
            >
              <Icons.home />
              Dashboard
            </a>
            <a
              className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              href="/team"
            >
              <Icons.users />
              Team
            </a>
            <a
              className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              href="/projects"
            >
              <Icons.folder />
              Projects
            </a>
            <a
              className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              href="/calendar"
            >
              <Icons.calendar />
              Calendar
            </a>
            <a
              className="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
              href="/settings"
            >
              <Icons.settings />
              Settings
            </a>
          </nav>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outlined">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const FromRight: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Drawer that slides in from the right as a settings panel.',
      },
    },
  },
  render: () => (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outlined">
          <Icons.settings className="mr-2" />
          Settings Panel
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>
            Customize your application preferences.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 space-y-6 p-4">
          <div>
            <h3 className="mb-3 font-medium">Appearance</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Dark mode</span>
                <Button size="sm" variant="outlined">
                  Toggle
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Compact mode</span>
                <Button size="sm" variant="outlined">
                  Toggle
                </Button>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-medium">Privacy</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics</span>
                <Button size="sm" variant="outlined">
                  Disable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cookies</span>
                <Button size="sm" variant="outlined">
                  Manage
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button>Save Changes</Button>
          <DrawerClose asChild>
            <Button variant="outlined">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const WithActions: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Drawer with a list of actionable items.',
      },
    },
  },
  render: function WithActionsStory() {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const actions = [
      { icon: Icons.edit, id: 'edit', label: 'Edit Document' },
      { icon: Icons.share, id: 'share', label: 'Share' },
      { icon: Icons.download, id: 'download', label: 'Download' },
      { icon: Icons.copy, id: 'duplicate', label: 'Duplicate' },
      { icon: Icons.archive, id: 'archive', label: 'Archive' },
      { icon: Icons.trash, id: 'delete', label: 'Delete' },
    ];

    return (
      <div className="space-y-4">
        <Drawer>
          <DrawerTrigger asChild>
            <Button>
              <Icons.moreVertical className="mr-2" />
              Document Actions
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Document Actions</DrawerTitle>
              <DrawerDescription>
                Choose an action to perform on this document.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="grid gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    className="justify-start"
                    variant="ghost"
                    onClick={() => setSelectedAction(action.label)}
                  >
                    <action.icon className="mr-3" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outlined">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {selectedAction && (
          <div className="border-border bg-muted/50 rounded-sm border p-3">
            <p className="text-sm">
              Selected action: <strong>{selectedAction}</strong>
            </p>
          </div>
        )}
      </div>
    );
  },
};

export const NestedContent: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Drawer with complex nested content including images and lists.',
      },
    },
  },
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outlined">Open Product Details</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Product Details</DrawerTitle>
          <DrawerDescription>
            View detailed information about this product.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 space-y-6 p-4">
          <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
            <span className="text-lg font-medium">Product Image</span>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Premium Headphones</h3>
            <p className="text-muted-foreground text-sm">
              High-quality wireless headphones with noise cancellation and
              premium sound quality.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold">$199.99</span>
            <span className="text-muted-foreground text-sm line-through">
              $249.99
            </span>
            <span className="bg-primary text-primary-foreground rounded-sm px-2 py-1 text-xs">
              20% OFF
            </span>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Features</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Active noise cancellation</li>
              <li>• 30-hour battery life</li>
              <li>• Wireless charging case</li>
              <li>• Premium leather finish</li>
              <li>• Touch controls</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Reviews</h4>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-500">★★★★☆</div>
              <span className="text-muted-foreground text-sm">
                4.2 out of 5 (128 reviews)
              </span>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button>Add to Cart</Button>
          <DrawerClose asChild>
            <Button variant="outlined">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Scrollable: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Drawer with scrollable content area for long text.',
      },
    },
  },
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outlined">View Long Content</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Terms of Service</DrawerTitle>
          <DrawerDescription>
            Please read our terms of service carefully.
          </DrawerDescription>
        </DrawerHeader>
        <div className="max-h-96 flex-1 space-y-4 overflow-y-auto p-4">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={`section-${index}`}>
              <h3 className="mb-2 font-medium">Section {index + 1}</h3>
              <p className="text-muted-foreground text-sm">
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
        <DrawerFooter>
          <Button>I Agree</Button>
          <DrawerClose asChild>
            <Button variant="outlined">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

export const Interactive: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Interactive drawer with form handling, controlled state, and comprehensive testing.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Find and click the trigger button
    const triggerButton = canvas.getByRole('button', {
      name: /open interactive drawer/i,
    });
    expect(triggerButton).toBeInTheDocument();

    await userEvent.click(triggerButton);

    // Wait for drawer to open (portal content)
    await waitFor(() => {
      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeVisible();
    });

    // Verify drawer header content
    expect(screen.getByText('Contact Information')).toBeVisible();
    expect(
      screen.getByText('Please provide your contact details.'),
    ).toBeVisible();

    // Test form interactions
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Initially submit should be disabled
    expect(submitButton).toBeDisabled();

    // Fill out form
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');

    // Submit button should now be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // Submit the form
    await userEvent.click(submitButton);

    // Verify drawer closes
    await waitFor(() => {
      const drawer: HTMLElement | null = screen.queryByRole('dialog');
      expect(drawer).toSatisfy(
        (el: HTMLElement | null) => el === null || !isElementVisible(el),
      );
    });

    // Verify state feedback
    expect(canvas.getByText(/drawer state:.*closed/i)).toBeVisible();

    // Verify drawer structure has proper data attributes
    await userEvent.click(triggerButton);

    await waitFor(() => {
      const drawer = screen
        .getByRole('dialog')
        .closest('[data-slot="drawer-content"]');
      expect(drawer).toHaveAttribute('data-slot', 'drawer-content');
    });

    // Close drawer with cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    await waitFor(() => {
      const drawer: HTMLElement | null = screen.queryByRole('dialog');
      expect(drawer).toSatisfy(
        (el: HTMLElement | null) => el === null || !isElementVisible(el),
      );
    });
  },
  render: function InteractiveStory() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
    });

    const handleSubmit = () => {
      console.log('Form submitted:', formData);
      setIsOpen(false);
      setFormData({ name: '', email: '' });
    };

    return (
      <div className="space-y-4">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button>Open Interactive Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Contact Information</DrawerTitle>
              <DrawerDescription>
                Please provide your contact details.
              </DrawerDescription>
            </DrawerHeader>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="drawer-name">Name</Label>
                <Input
                  id="drawer-name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drawer-email">Email</Label>
                <Input
                  id="drawer-email"
                  placeholder="Enter your email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
            </div>
            <DrawerFooter>
              <Button
                disabled={!formData.name || !formData.email}
                onClick={handleSubmit}
              >
                Submit
              </Button>
              <DrawerClose asChild>
                <Button variant="outlined">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <div className="border-border bg-muted/30 rounded-sm border p-3">
          <p className="text-sm">Drawer state: {isOpen ? 'Open' : 'Closed'}</p>
          <p className="text-sm">Form data: {JSON.stringify(formData)}</p>
        </div>
      </div>
    );
  },
};
