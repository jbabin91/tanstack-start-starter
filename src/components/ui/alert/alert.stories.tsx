import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';

import { Icons } from '@/components/icons';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert/alert';
import { Button } from '@/components/ui/button';

const meta = {
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'info', 'success', 'warning'],
    },
  },
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'UI/Feedback/Alert',
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md">
      <Icons.info />
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>
        This is a default alert with some helpful information.
      </AlertDescription>
    </Alert>
  ),
};

export const Error: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md" variant="error">
      <Icons.alertCircle />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again to continue.
      </AlertDescription>
    </Alert>
  ),
};

export const Info: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md" variant="info">
      <Icons.info />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        Your account settings have been updated successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md" variant="success">
      <Icons.check />
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Your changes have been saved and are now live.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md" variant="warning">
      <Icons.alertTriangle />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        This action cannot be undone. Please proceed with caution.
      </AlertDescription>
    </Alert>
  ),
};

export const WithoutIcon: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Simple Alert</AlertTitle>
      <AlertDescription>
        This alert doesn&apos;t have an icon, just the title and description.
      </AlertDescription>
    </Alert>
  ),
};

export const TitleOnly: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md" variant="info">
      <Icons.info />
      <AlertTitle>Quick notification</AlertTitle>
    </Alert>
  ),
};

export const WithActions: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md" variant="warning">
      <Icons.alertTriangle />
      <AlertTitle>Confirm Action</AlertTitle>
      <AlertDescription>
        <p className="mb-3">
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
        <div className="flex gap-2">
          <Button color="error" size="sm">
            Delete
          </Button>
          <Button size="sm" variant="outlined">
            Cancel
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  ),
};

export const LongContent: Story = {
  args: {},
  render: () => (
    <Alert className="max-w-md" variant="info">
      <Icons.info />
      <AlertTitle>System Maintenance Notice</AlertTitle>
      <AlertDescription>
        <p>
          We&apos;ll be performing scheduled maintenance on our servers this
          weekend from 2:00 AM to 6:00 AM EST on Saturday, March 15th.
        </p>
        <p className="mt-2">
          During this time, some features may be temporarily unavailable. We
          appreciate your patience and will work to minimize any disruption.
        </p>
      </AlertDescription>
    </Alert>
  ),
};

export const SystemAlerts: Story = {
  args: {},
  render: () => (
    <div className="max-w-md space-y-4">
      <Alert variant="info">
        <Icons.download />
        <AlertTitle>Update Available</AlertTitle>
        <AlertDescription>
          A new version of the application is ready to install.
        </AlertDescription>
      </Alert>

      <Alert variant="warning">
        <Icons.wifi />
        <AlertTitle>Connection Issue</AlertTitle>
        <AlertDescription>
          Your internet connection appears to be unstable.
        </AlertDescription>
      </Alert>

      <Alert variant="success">
        <Icons.shield />
        <AlertTitle>Backup Complete</AlertTitle>
        <AlertDescription>
          Your data has been successfully backed up to the cloud.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const FormValidation: Story = {
  args: {},
  render: () => (
    <div className="max-w-md space-y-4">
      <Alert variant="error">
        <Icons.alertCircle />
        <AlertTitle>Validation Error</AlertTitle>
        <AlertDescription>
          Please correct the following errors:
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>Email address is required</li>
            <li>Password must be at least 8 characters</li>
            <li>Phone number format is invalid</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="max-w-md space-y-4">
      <Alert>
        <Icons.info />
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>Default variant alert.</AlertDescription>
      </Alert>

      <Alert variant="info">
        <Icons.info />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Info variant alert.</AlertDescription>
      </Alert>

      <Alert variant="success">
        <Icons.check />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Success variant alert.</AlertDescription>
      </Alert>

      <Alert variant="warning">
        <Icons.alertTriangle />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Warning variant alert.</AlertDescription>
      </Alert>

      <Alert variant="error">
        <Icons.alertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Error variant alert.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const Interactive: Story = {
  args: {},
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');

    // Test that alert is visible and has correct ARIA role
    expect(alert).toBeInTheDocument();
    expect(alert).toBeVisible();
    expect(alert).toHaveAttribute('role', 'alert');

    // Test that alert has correct data attributes
    expect(alert).toHaveAttribute('data-slot', 'alert');

    // Test alert structure
    const title = canvas.getByText('Interactive Alert');
    const description = canvas.getByText(/this alert demonstrates/i);

    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute('data-slot', 'alert-title');

    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('data-slot', 'alert-description');

    // Test accessibility
    expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border');
  },
  render: () => (
    <Alert className="max-w-md" variant="info">
      <Icons.info />
      <AlertTitle>Interactive Alert</AlertTitle>
      <AlertDescription>
        This alert demonstrates the accessible structure and ARIA roles.
      </AlertDescription>
    </Alert>
  ),
};
