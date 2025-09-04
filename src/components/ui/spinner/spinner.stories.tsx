import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'UI/Feedback/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A spinner component for indicating loading states. Features multiple sizes and can include text labels for better user experience.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'The size of the spinner.',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      table: {
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: '"medium"' },
      },
    },
    show: {
      description: 'Whether the spinner is visible.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    children: {
      description: 'Optional text content to display below the spinner.',
      control: { type: 'text' },
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    className: {
      description: 'Additional CSS classes for the spinner icon.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default spinner with medium size.',
      },
    },
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center space-x-8">
      <div className="text-center">
        <Spinner size="small" {...args} />
        <p className="text-muted-foreground mt-2 text-xs">Small</p>
      </div>
      <div className="text-center">
        <Spinner size="medium" {...args} />
        <p className="text-muted-foreground mt-2 text-xs">Medium</p>
      </div>
      <div className="text-center">
        <Spinner size="large" {...args} />
        <p className="text-muted-foreground mt-2 text-xs">Large</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different spinner sizes: small (24px), medium (32px), and large (48px).',
      },
    },
  },
};

export const WithText: Story = {
  render: (args) => (
    <div className="space-y-6">
      <Spinner {...args}>
        <span className="text-muted-foreground mt-2 text-sm">Loading...</span>
      </Spinner>
      <Spinner size="small" {...args}>
        <span className="text-muted-foreground mt-1 text-xs">Please wait</span>
      </Spinner>
      <Spinner size="large" {...args}>
        <span className="text-muted-foreground mt-3 text-base">
          Processing your request
        </span>
      </Spinner>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Spinners with descriptive text labels for better user feedback.',
      },
    },
  },
};

export const InButtons: Story = {
  render: (args) => (
    <div className="flex space-x-4">
      <Button disabled className="inline-flex items-center">
        <Spinner className="mr-2" size="small" {...args} />
        Saving...
      </Button>
      <Button disabled className="inline-flex items-center" variant="outlined">
        <Spinner className="mr-2" size="small" {...args} />
        Loading
      </Button>
      <Button disabled aria-label="Loading" size="icon">
        <Spinner size="small" {...args} />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinners integrated into buttons for loading states.',
      },
    },
  },
};

export const InCards: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg border p-6">
        <div className="flex h-32 items-center justify-center">
          <Spinner {...args}>
            <span className="text-muted-foreground mt-2 text-sm">
              Loading content...
            </span>
          </Spinner>
        </div>
      </div>
      <div className="rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">User Profile</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Spinner size="small" {...args} />
            <span className="text-muted-foreground text-sm">
              Loading profile data...
            </span>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Spinners used within card components for loading states.',
      },
    },
  },
};

export const Overlay: Story = {
  render: (args) => (
    <div className="relative">
      <div className="rounded-lg border p-8">
        <h3 className="mb-4 text-xl font-semibold">Form Content</h3>
        <div className="space-y-4">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="name-input"
            >
              Name
            </label>
            <input
              className="w-full rounded-md border px-3 py-2"
              id="name-input"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="email-input"
            >
              Email
            </label>
            <input
              className="w-full rounded-md border px-3 py-2"
              id="email-input"
              placeholder="Enter your email"
            />
          </div>
          <Button>Submit</Button>
        </div>
      </div>
      <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-sm">
        <Spinner size="large" {...args}>
          <span className="text-foreground mt-3 text-base font-medium">
            Submitting form...
          </span>
        </Spinner>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Spinner used as an overlay to indicate loading over existing content.',
      },
    },
  },
};

export const InlineSpinners: Story = {
  render: (args) => (
    <div className="space-y-4">
      <p className="flex items-center text-sm">
        <Spinner className="mr-2" size="small" {...args} />
        Checking availability...
      </p>
      <p className="flex items-center text-sm">
        <Spinner className="mr-2" size="small" {...args} />
        Validating credentials...
      </p>
      <p className="flex items-center text-sm">
        <Spinner className="mr-2" size="small" {...args} />
        Syncing data...
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Small inline spinners for indicating specific loading processes.',
      },
    },
  },
};

export const ColoredSpinners: Story = {
  render: (args) => (
    <div className="flex items-center space-x-8">
      <div className="text-center">
        <Spinner className="text-blue-500" {...args} />
        <p className="text-muted-foreground mt-2 text-xs">Blue</p>
      </div>
      <div className="text-center">
        <Spinner className="text-green-500" {...args} />
        <p className="text-muted-foreground mt-2 text-xs">Green</p>
      </div>
      <div className="text-center">
        <Spinner className="text-red-500" {...args} />
        <p className="text-muted-foreground mt-2 text-xs">Red</p>
      </div>
      <div className="text-center">
        <Spinner className="text-purple-500" {...args} />
        <p className="text-muted-foreground mt-2 text-xs">Purple</p>
      </div>
      <div className="text-center">
        <Spinner className="text-orange-500" {...args} />
        <p className="text-muted-foreground mt-2 text-xs">Orange</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Spinners with custom colors using Tailwind CSS text color classes.',
      },
    },
  },
};

export const LoadingStates: Story = {
  render: (args) => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Dashboard</h3>
          <Spinner size="small" {...args} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-sm bg-gray-50 p-4 text-center">
            <Spinner size="small" {...args} />
            <p className="text-muted-foreground mt-2 text-xs">Users</p>
          </div>
          <div className="rounded-sm bg-gray-50 p-4 text-center">
            <Spinner size="small" {...args} />
            <p className="text-muted-foreground mt-2 text-xs">Revenue</p>
          </div>
          <div className="rounded-sm bg-gray-50 p-4 text-center">
            <Spinner size="small" {...args} />
            <p className="text-muted-foreground mt-2 text-xs">Orders</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multiple spinners showing different parts of an interface loading.',
      },
    },
  },
};

export const ConditionalSpinner: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Spinner show={true} {...args} />
        <span className="text-sm">Visible spinner</span>
      </div>
      <div className="flex items-center space-x-4">
        <Spinner show={false} {...args} />
        <span className="text-sm">Hidden spinner</span>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Conditional spinner visibility using the show prop.',
      },
    },
  },
};

export const AccessibilityDemo: Story = {
  render: (args) => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Accessibility Features</h4>
      <div className="text-muted-foreground space-y-3 text-xs">
        <p>• Uses role=&quot;status&quot; for screen reader announcements</p>
        <p>• aria-live=&quot;polite&quot; provides non-intrusive updates</p>
        <p>• Text labels provide context for loading states</p>
        <p>• Keyboard navigation remains functional during loading</p>
      </div>
      <div className="pt-2">
        <Spinner {...args}>
          <span className="text-muted-foreground mt-2 text-sm">
            Loading user preferences...
          </span>
        </Spinner>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates accessibility features including proper ARIA attributes and screen reader support.',
      },
    },
  },
};

export const InteractiveSpinner: Story = {
  args: {
    size: 'medium',
    show: true,
  },
  render: (args) => (
    <Spinner {...args}>
      <span className="text-muted-foreground mt-2 text-sm">Loading...</span>
    </Spinner>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Interactive spinner for testing different sizes and visibility states.',
      },
    },
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find spinner by role
    const spinner = canvas.getByRole('status');
    expect(spinner).toBeInTheDocument();

    // Verify accessibility attributes
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(spinner).toHaveAttribute('role', 'status');

    // Verify the spinner is visible (has flex class)
    expect(spinner).toHaveClass('flex');
    expect(spinner).not.toHaveClass('hidden');

    // Find the spinner icon (svg element)
    const spinnerIcon = spinner.querySelector('svg');
    expect(spinnerIcon).toBeInTheDocument();
    expect(spinnerIcon).toHaveClass('animate-spin');
    expect(spinnerIcon).toHaveClass('text-primary');

    // Verify default medium size
    expect(spinnerIcon).toHaveClass('size-8');

    // Verify text content
    expect(spinner).toHaveTextContent('Loading...');
  },
};
