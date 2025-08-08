import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  title: 'UI/Overlays/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A modal dialog component built on Radix UI. Accessible with focus trapping, ESC key handling, and WCAG AA compliant. Use for confirmations, forms, or displaying additional information.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: 'Whether the dialog is open (controlled)',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
    },
    defaultOpen: {
      description: 'Whether the dialog is open by default (uncontrolled)',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    modal: {
      description: 'Whether the dialog is modal',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    onOpenChange: {
      description: 'Callback when open state changes',
      action: 'openChanged',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic dialog
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="contained">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="name">
              Name
            </Label>
            <Input className="col-span-3" defaultValue="John Doe" id="name" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="username">
              Username
            </Label>
            <Input
              className="col-span-3"
              defaultValue="@johndoe"
              id="username"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outlined">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" variant="contained">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Confirmation dialog
export const Confirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="error" variant="contained">
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outlined">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button color="error" variant="contained">
              Delete Account
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Without close button
export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outlined">Open Modal Dialog</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Modal Dialog</DialogTitle>
          <DialogDescription>
            This dialog doesn&apos;t have a close button in the top-right
            corner. You must use the buttons below to close it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="contained">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Information dialog
export const Information: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="info" variant="contained">
          Show Info
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Update Available</DialogTitle>
          <DialogDescription>
            A new version of the application is available with bug fixes and
            improvements.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <h4 className="font-medium">What&apos;s New:</h4>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>Fixed login issues on mobile devices</li>
              <li>Improved performance and stability</li>
              <li>Updated security protocols</li>
              <li>Enhanced user interface</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outlined">Later</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button color="info" variant="contained">
              Update Now
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Form dialog component
function FormDialogExample() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert(`Account created for: ${formData.email}`);
    setOpen(false);
    setFormData({ email: '', password: '', confirmPassword: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button color="success" variant="contained">
          Create Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Enter your details below to create a new account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                required
                id="email"
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                required
                id="password"
                placeholder="Enter password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                required
                id="confirm-password"
                placeholder="Confirm password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outlined">
                Cancel
              </Button>
            </DialogClose>
            <Button color="success" type="submit" variant="contained">
              Create Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Form dialog
export const FormDialog: Story = {
  render: () => <FormDialogExample />,
};

// Controlled dialog component
function ControlledDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outlined">Open Controlled Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>
              This dialog&apos;s open state is controlled by external state.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              The dialog can be controlled programmatically using the buttons
              outside the dialog.
            </p>
          </div>
          <DialogFooter>
            <Button variant="contained" onClick={() => setOpen(false)}>
              Close Dialog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex gap-2">
        <Button
          disabled={open}
          variant="outlined"
          onClick={() => setOpen(true)}
        >
          Open Dialog
        </Button>
        <Button
          disabled={!open}
          variant="outlined"
          onClick={() => setOpen(false)}
        >
          Close Dialog
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Dialog is currently: {open ? 'Open' : 'Closed'}
      </p>
    </div>
  );
}

// Controlled dialog
export const Controlled: Story = {
  render: () => <ControlledDialogExample />,
};

// Large content dialog
export const LargeContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="contained">View Terms</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read our terms and conditions carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <section>
            <h3 className="mb-2 text-base font-semibold">
              1. Acceptance of Terms
            </h3>
            <p className="text-muted-foreground text-sm">
              By accessing and using this service, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to abide by the above, please do not use this service.
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-base font-semibold">2. Privacy Policy</h3>
            <p className="text-muted-foreground text-sm">
              Your privacy is important to us. Our Privacy Policy explains how
              we collect, use, and protect your information when you use our
              service. By using our service, you agree to the collection and use
              of information in accordance with our Privacy Policy.
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-base font-semibold">
              3. User Responsibilities
            </h3>
            <p className="text-muted-foreground text-sm">
              You are responsible for safeguarding the password that you use to
              access the service and for all activities that occur under your
              password. You agree not to disclose your password to any third
              party.
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-base font-semibold">
              4. Service Availability
            </h3>
            <p className="text-muted-foreground text-sm">
              We strive to provide continuous service availability, but we do
              not guarantee that the service will be uninterrupted or
              error-free. We reserve the right to modify or discontinue the
              service at any time.
            </p>
          </section>
          <section>
            <h3 className="mb-2 text-base font-semibold">
              5. Limitation of Liability
            </h3>
            <p className="text-muted-foreground text-sm">
              In no event shall our company be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses.
            </p>
          </section>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outlined">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="contained">Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Interactive test
export const Interactive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="dialog-trigger" variant="contained">
          Test Dialog
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-content">
        <DialogHeader>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>
            This dialog is used for interactive testing.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Use ESC key or click outside to close.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button data-testid="dialog-close" variant="contained">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open dialog', async () => {
      const trigger = canvas.getByTestId('dialog-trigger');
      await userEvent.click(trigger);

      // Wait for trigger to show expanded state
      await waitFor(
        () => {
          expect(trigger).toHaveAttribute('aria-expanded', 'true');
        },
        { timeout: 2000 },
      );

      // Give animation time to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Wait for dialog to appear - dialog content is rendered in a portal
      await waitFor(
        async () => {
          const dialog = within(document.body).getByTestId('dialog-content');
          await expect(dialog).toBeVisible();
        },
        { timeout: 2000 },
      );

      // Check that title and description are visible within the dialog
      const dialogContent = within(document.body).getByTestId('dialog-content');
      await expect(
        within(dialogContent).getByText('Test Dialog'),
      ).toBeVisible();
      await expect(
        within(dialogContent).getByText(
          'This dialog is used for interactive testing.',
        ),
      ).toBeVisible();
    });

    await step('Close dialog with button', async () => {
      const closeButton = within(document.body).getByTestId('dialog-close');
      await userEvent.click(closeButton);

      // Wait for close animation to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if dialog is closed (either removed or not visible)
      const dialogContent = within(document.body).queryByTestId(
        'dialog-content',
      );
      if (dialogContent) {
        await expect(dialogContent).not.toBeVisible();
      } else {
        expect(dialogContent).toBeNull();
      }
    });

    await step('Open and close with ESC key', async () => {
      // Open dialog again
      const trigger = canvas.getByTestId('dialog-trigger');
      await userEvent.click(trigger);

      // Wait for trigger to show expanded state
      await waitFor(
        () => {
          expect(trigger).toHaveAttribute('aria-expanded', 'true');
        },
        { timeout: 2000 },
      );

      // Give animation time to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Wait for dialog to appear and be visible
      await waitFor(
        async () => {
          const dialog = within(document.body).getByTestId('dialog-content');
          await expect(dialog).toBeVisible();
        },
        { timeout: 2000 },
      );

      // Close with ESC key
      await userEvent.keyboard('{Escape}');

      // Wait for close animation to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if dialog is closed (either removed or not visible)
      const dialogContent = within(document.body).queryByTestId(
        'dialog-content',
      );
      if (dialogContent) {
        await expect(dialogContent).not.toBeVisible();
      } else {
        expect(dialogContent).toBeNull();
      }
    });
  },
};

// Custom styling
export const CustomStyling: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="warning" variant="contained">
          Warning Dialog
        </Button>
      </DialogTrigger>
      <DialogContent className="border-warning bg-warning/5 border-2">
        <DialogHeader>
          <DialogTitle className="text-warning">System Warning</DialogTitle>
          <DialogDescription className="text-warning-text">
            This is a custom styled dialog with warning colors and styling.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-warning/10 border-warning/20 rounded-md border p-4">
            <p className="text-warning-text text-sm">
              ⚠️ Your subscription will expire in 3 days. Please renew to
              continue using all features.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outlined">Remind Later</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button color="warning" variant="contained">
              Renew Now
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
