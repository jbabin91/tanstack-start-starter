import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { Button } from '@/components/ui/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'UI/Overlays/Alert Dialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A modal dialog that interrupts the user with important content and expects a response. Built with Radix UI primitives and includes accessible keyboard navigation and focus management.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outlined">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default alert dialog with title, description, and actions.',
      },
    },
  },
};

export const DestructiveAction: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button color="error">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your account? This action is
            permanent and cannot be undone. All your data will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Account</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
            Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert dialog for destructive actions like account deletion.',
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Custom Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-2xl text-blue-600">
            🎉 Congratulations!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Your account has been successfully created. Welcome to our platform!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-center">
          <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
            Get Started
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert dialog with custom styling and centered content.',
      },
    },
  },
};

export const ConfirmationDialog: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Save Changes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Would you like to save them before
            continuing?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Discard</AlertDialogCancel>
          <AlertDialogAction>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Confirmation dialog for saving changes.',
      },
    },
  },
};

export const LongContent: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outlined">Terms & Conditions</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh]">
        <AlertDialogHeader>
          <AlertDialogTitle>Terms and Conditions</AlertDialogTitle>
          <AlertDialogDescription>
            Please read and accept our terms and conditions to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-64 overflow-y-auto text-sm">
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <p className="mb-4">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
          <p className="mb-4">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
          <p className="mb-4">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Decline</AlertDialogCancel>
          <AlertDialogAction>Accept</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert dialog with scrollable content for lengthy text.',
      },
    },
  },
};

export const SingleAction: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Show Info</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Information</AlertDialogTitle>
          <AlertDialogDescription>
            Your request has been processed successfully. You will receive a
            confirmation email shortly.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert dialog with only one action button.',
      },
    },
  },
};

export const MultipleTriggers: Story = {
  render: () => (
    <div className="flex space-x-4">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button color="error">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be permanently deleted. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Archive</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Item</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be moved to your archive. You can restore it later
              if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple alert dialogs with different triggers and content.',
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Show Warning</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
          </div>
          <AlertDialogTitle>Warning</AlertDialogTitle>
          <AlertDialogDescription>
            This action may have unintended consequences. Please review before
            proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-yellow-600 hover:bg-yellow-700">
            Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert dialog with icon and centered content.',
      },
    },
  },
};

export const ResponsiveDialog: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Mobile Responsive</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl">
            Responsive Dialog
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base">
            This dialog adapts to different screen sizes for optimal mobile and
            desktop experience.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className="w-full sm:w-auto">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Alert dialog with responsive design that adapts to different screen sizes.',
      },
    },
  },
};

export const InteractiveDialog: Story = {
  args: {
    onOpenChange: fn(),
  },
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button>Test Interactions</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Interactive Test</AlertDialogTitle>
          <AlertDialogDescription>
            This dialog tests user interactions and callbacks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive alert dialog for testing user interactions.',
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Find and click the trigger button
    const triggerButton = canvas.getByRole('button', {
      name: 'Test Interactions',
    });
    expect(triggerButton).toBeInTheDocument();

    await userEvent.click(triggerButton);

    // Wait for dialog to appear in portal
    await waitFor(
      () => {
        expect(screen.getByRole('alertdialog')).toBeVisible();
      },
      { timeout: 1000 },
    );

    // Verify dialog content
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('data-slot', 'alert-dialog-content');

    // Check title and description
    expect(
      screen.getByRole('heading', { name: 'Interactive Test' }),
    ).toBeVisible();
    expect(
      screen.getByText('This dialog tests user interactions and callbacks.'),
    ).toBeVisible();

    // Find action buttons within the dialog
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });

    expect(cancelButton).toBeVisible();
    expect(confirmButton).toBeVisible();

    // Test confirm action
    await userEvent.click(confirmButton);

    // Wait for dialog to close
    await waitFor(
      () => {
        const dialog = screen.queryByRole('alertdialog');
        expect(dialog).toBeNull();
      },
      { timeout: 1000 },
    );

    // Verify onOpenChange was called
    expect(args.onOpenChange).toHaveBeenCalled();
  },
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Accessibility Features</h4>
      <div className="text-muted-foreground space-y-3 text-xs">
        <p>
          • Focus management with automatic focus on first focusable element
        </p>
        <p>• Keyboard navigation (Tab, Shift+Tab, Escape)</p>
        <p>• ARIA labeling with alertdialog role</p>
        <p>• Screen reader support with proper semantic markup</p>
        <p>• Background click and Escape key to close</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Test Accessibility</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accessibility Test</AlertDialogTitle>
            <AlertDialogDescription>
              Try using Tab, Shift+Tab, and Escape keys to navigate and close
              this dialog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates accessibility features including keyboard navigation, focus management, and screen reader support.',
      },
    },
  },
};
