import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast, Toaster } from '@/components/ui/sonner/sonner';

const meta = {
  component: Toaster,
  decorators: [
    (Story) => (
      <div className="relative min-h-[400px] w-[600px]">
        <Story />
        <Toaster />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A toast notification component built on Sonner that provides rich, accessible notifications with multiple variants, actions, and automatic theming. WCAG AA compliant with keyboard navigation and screen reader support.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Feedback/Sonner',
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test default toast
    const defaultButton = canvas.getByRole('button', { name: 'Default Toast' });
    await userEvent.click(defaultButton);

    await waitFor(() => {
      expect(screen.getByText('Default notification')).toBeVisible();
    });

    // Test success toast
    const successButton = canvas.getByRole('button', { name: 'Success Toast' });
    await userEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByText('Success message!')).toBeVisible();
    });

    // Test error toast
    const errorButton = canvas.getByRole('button', { name: 'Error Toast' });
    await userEvent.click(errorButton);

    await waitFor(() => {
      expect(screen.getByText('Error occurred!')).toBeVisible();
    });
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Toast Notifications</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outlined"
          onClick={() => toast('Default notification')}
        >
          Default Toast
        </Button>
        <Button
          variant="outlined"
          onClick={() => toast.success('Success message!')}
        >
          Success Toast
        </Button>
        <Button
          variant="outlined"
          onClick={() => toast.error('Error occurred!')}
        >
          Error Toast
        </Button>
        <Button
          variant="outlined"
          onClick={() => toast.warning('Warning alert!')}
        >
          Warning Toast
        </Button>
        <Button
          variant="outlined"
          onClick={() => toast.info('Information note')}
        >
          Info Toast
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            toast('Custom message', {
              description: 'This is a custom toast with description',
            })
          }
        >
          With Description
        </Button>
      </div>
    </div>
  ),
};

export const WithActions: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test toast with action
    const actionButton = canvas.getByRole('button', { name: 'With Action' });
    await userEvent.click(actionButton);

    await waitFor(() => {
      expect(screen.getByText('File uploaded successfully')).toBeVisible();
      expect(screen.getByRole('button', { name: 'View' })).toBeVisible();
    });

    // Test clicking the action button
    const viewButton = screen.getByRole('button', { name: 'View' });
    await userEvent.click(viewButton);

    // Test undo functionality
    const undoButton = canvas.getByRole('button', { name: 'With Undo' });
    await userEvent.click(undoButton);

    await waitFor(() => {
      expect(screen.getByText('Changes saved!')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Undo' })).toBeVisible();
    });
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Toast with Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outlined"
          onClick={() =>
            toast('File uploaded successfully', {
              action: {
                label: 'View',
                onClick: () => console.log('View clicked'),
              },
            })
          }
        >
          With Action
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            toast.success('Changes saved!', {
              action: {
                label: 'Undo',
                onClick: () => toast.info('Changes undone'),
              },
            })
          }
        >
          With Undo
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            toast.error('Failed to delete item', {
              action: {
                label: 'Retry',
                onClick: () => toast.loading('Retrying...'),
              },
            })
          }
        >
          With Retry
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            toast('New message received', {
              description: 'Click to view the message',
              action: {
                label: 'Open',
                onClick: () => toast.success('Message opened'),
              },
            })
          }
        >
          Message Action
        </Button>
      </div>
    </div>
  ),
};

export const LoadingStates: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test simple loading toast
    const loadingButton = canvas.getByRole('button', { name: 'Loading Toast' });
    await userEvent.click(loadingButton);

    await waitFor(() => {
      expect(screen.getByText('Loading data...')).toBeVisible();
    });

    // Test promise toast
    const promiseButton = canvas.getByRole('button', { name: 'Promise Toast' });
    await userEvent.click(promiseButton);

    await waitFor(() => {
      expect(screen.getByText('Uploading file...')).toBeVisible();
    });

    // Wait for promise to resolve
    await waitFor(
      () => {
        expect(screen.getByText('File uploaded!')).toBeVisible();
      },
      { timeout: 3000 },
    );
  },
  render: () => {
    const [isLoading, setIsLoading] = useState(false);

    const simulateAsyncAction = () => {
      setIsLoading(true);
      const loadingToast = toast.loading('Processing request...');

      setTimeout(() => {
        toast.success('Request completed successfully!', {
          id: loadingToast,
        });
        setIsLoading(false);
      }, 3000);
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Loading States</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            disabled={isLoading}
            variant="outlined"
            onClick={() => toast.loading('Loading data...')}
          >
            Loading Toast
          </Button>
          <Button
            disabled={isLoading}
            variant="outlined"
            onClick={simulateAsyncAction}
          >
            Simulate Async
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const promise = new Promise((resolve) => {
                setTimeout(resolve, 2000);
              });

              toast.promise(promise, {
                error: 'Upload failed',
                loading: 'Uploading file...',
                success: 'File uploaded!',
              });
            }}
          >
            Promise Toast
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const promise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Network error')), 2000);
              });

              toast.promise(promise, {
                error: (err) => `Connection failed: ${err.message}`,
                loading: 'Connecting...',
                success: 'Connected successfully!',
              });
            }}
          >
            Promise Error
          </Button>
        </div>
      </div>
    );
  },
};

export const CustomStyling: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test rich content toast
    const richButton = canvas.getByRole('button', { name: 'Rich Content' });
    await userEvent.click(richButton);

    await waitFor(() => {
      expect(screen.getByText('Task completed!')).toBeVisible();
      expect(screen.getByText('Your report has been generated')).toBeVisible();
    });

    // Test persistent toast
    const persistentButton = canvas.getByRole('button', {
      name: 'Persistent',
    });
    await userEvent.click(persistentButton);

    await waitFor(() => {
      expect(screen.getByText('Critical error')).toBeVisible();
      expect(
        screen.getByText('This toast persists until closed'),
      ).toBeVisible();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeVisible();
    });
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Custom Styling</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outlined"
          onClick={() =>
            toast('Custom styled toast', {
              className: 'border-blue-500 bg-blue-50 text-blue-900',
              description: 'This toast has custom styling',
            })
          }
        >
          Custom Colors
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            toast(
              <div className="flex items-center gap-2">
                <Icons.checkCircle className="text-green-600" size="lg" />
                <div>
                  <div className="font-medium">Task completed!</div>
                  <div className="text-muted-foreground text-sm">
                    Your report has been generated
                  </div>
                </div>
              </div>,
              {
                duration: 5000,
              },
            )
          }
        >
          Rich Content
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            toast.success('Operation successful', {
              duration: 1000 * 10,
              description: 'This toast stays for 10 seconds',
            })
          }
        >
          Long Duration
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            toast.error('Critical error', {
              action: {
                label: 'Dismiss',
                onClick: () => toast.dismiss(),
              },
              description: 'This toast persists until closed',
              duration: Number.POSITIVE_INFINITY,
            })
          }
        >
          Persistent
        </Button>
      </div>
    </div>
  ),
};

export const InteractiveForm: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test form validation - submit empty form
    const submitButton = canvas.getByRole('button', { name: 'Create Account' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all fields')).toBeVisible();
      expect(screen.getByText('Name and email are required')).toBeVisible();
    });

    // Fill out form with valid data
    const nameInput = canvas.getByLabelText('Name');
    const emailInput = canvas.getByLabelText('Email');

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');

    // Submit form
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submitting form...')).toBeVisible();
    });

    // Wait for success message
    await waitFor(
      () => {
        expect(
          screen.getByText('Welcome John Doe! Account created successfully.'),
        ).toBeVisible();
      },
      { timeout: 2500 },
    );
  },
  render: () => {
    const [formData, setFormData] = useState({ name: '', email: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name || !formData.email) {
        toast.error('Please fill in all fields', {
          description: 'Name and email are required',
        });
        return;
      }

      const submitPromise = new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (formData.email.includes('@')) {
            resolve();
          } else {
            reject(new Error('Invalid email format'));
          }
        }, 1500);
      });

      toast.promise(submitPromise, {
        error: (err) => `Submission failed: ${err.message}`,
        loading: 'Submitting form...',
        success: () => {
          setFormData({ name: '', email: '' });
          return `Welcome ${formData.name}! Account created successfully.`;
        },
      });
    };

    return (
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Registration Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <Button className="w-full" type="submit">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  },
};

export const DismissalControls: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Create multiple toasts
    const multipleButton = canvas.getByRole('button', {
      name: 'Multiple Toasts',
    });
    await userEvent.click(multipleButton);

    await waitFor(() => {
      expect(screen.getByText('First notification')).toBeVisible();
      expect(screen.getByText('Second notification')).toBeVisible();
      expect(screen.getByText('Third notification')).toBeVisible();
    });

    // Test dismiss all
    const dismissButton = canvas.getByRole('button', { name: 'Dismiss All' });
    await userEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('First notification')).not.toBeVisible();
      expect(screen.queryByText('Second notification')).not.toBeVisible();
      expect(screen.queryByText('Third notification')).not.toBeVisible();
    });

    // Test manual dismiss
    const manualButton = canvas.getByRole('button', { name: 'Manual Dismiss' });
    await userEvent.click(manualButton);

    await waitFor(() => {
      expect(screen.getByText('Manual dismiss')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    // Click the close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Manual dismiss')).not.toBeVisible();
    });
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Toast Dismissal</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outlined"
          onClick={() => {
            toast('First notification');
            toast('Second notification');
            toast('Third notification');
          }}
        >
          Multiple Toasts
        </Button>
        <Button
          color="error"
          variant="outlined"
          onClick={() => toast.dismiss()}
        >
          Dismiss All
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const toastId = toast('Dismissible toast', {
              description: 'Click the button to dismiss this specific toast',
            });

            setTimeout(() => {
              toast.dismiss(toastId);
            }, 2000);
          }}
        >
          Auto Dismiss
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const toastId = toast.info('Manual dismiss', {
              duration: Number.POSITIVE_INFINITY,
              action: {
                label: 'Close',
                onClick: () => toast.dismiss(toastId),
              },
            });
          }}
        >
          Manual Dismiss
        </Button>
      </div>
    </div>
  ),
};

export const Positioning: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test different position buttons
    const topRightButton = canvas.getByRole('button', { name: 'Top Right' });
    await userEvent.click(topRightButton);

    await waitFor(() => {
      expect(screen.getByText('Top Right (default)')).toBeVisible();
      expect(
        screen.getByText('This appears in the top right corner'),
      ).toBeVisible();
    });

    const bottomRightButton = canvas.getByRole('button', {
      name: 'Bottom Right',
    });
    await userEvent.click(bottomRightButton);

    await waitFor(() => {
      expect(screen.getByText('Bottom Right')).toBeVisible();
    });
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Toast Positioning</h3>
      <p className="text-muted-foreground text-sm">
        Note: Position changes require page refresh to take effect in Storybook.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outlined"
          onClick={() => {
            toast('Top Right (default)', {
              description: 'This appears in the top right corner',
            });
          }}
        >
          Top Right
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            toast.success('Bottom Right', {
              description: 'This would appear in bottom right with config',
            });
          }}
        >
          Bottom Right
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            toast.info('Top Center', {
              description: 'This would appear in top center with config',
            });
          }}
        >
          Top Center
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            toast.warning('Bottom Center', {
              description: 'This would appear in bottom center with config',
            });
          }}
        >
          Bottom Center
        </Button>
      </div>
      <div className="text-muted-foreground rounded-lg border p-4 text-xs">
        <Icons.info className="mr-2 inline" />
        In a real application, you would configure the Toaster position prop:
        <code className="ml-2 rounded-sm bg-gray-100 px-1">
          &lt;Toaster position=&quot;bottom-right&quot; /&gt;
        </code>
      </div>
    </div>
  ),
};
