import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge/badge';

const meta = {
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'secondary',
        'error',
        'success',
        'warning',
        'info',
        'success-solid',
        'warning-solid',
        'error-solid',
        'outline',
      ],
    },
  },
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'UI/Data Display/Badge',
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const WithIcon: Story = {
  args: {},
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>
        <Icons.check />
        Complete
      </Badge>
      <Badge variant="warning">
        <Icons.alertTriangle />
        Warning
      </Badge>
      <Badge variant="error">
        <Icons.x />
        Error
      </Badge>
      <Badge variant="secondary">
        <Icons.clock />
        Pending
      </Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  args: {},
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Inactive</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">Archived</Badge>
    </div>
  ),
};

export const NotificationBadge: Story = {
  args: {},
  render: () => (
    <div className="relative inline-flex">
      <Icons.bell size="xl" />
      <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
        3
      </Badge>
    </div>
  ),
};

export const CategoryBadges: Story = {
  args: {},
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Technology</h3>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">React</Badge>
          <Badge variant="outline">TypeScript</Badge>
          <Badge variant="outline">Next.js</Badge>
          <Badge variant="outline">Tailwind CSS</Badge>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Priority</h3>
        <div className="flex flex-wrap gap-1">
          <Badge variant="error">High</Badge>
          <Badge variant="warning">Medium</Badge>
          <Badge variant="secondary">Low</Badge>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveBadges: Story = {
  args: {},
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge asChild>
        <a className="cursor-pointer" href="https://example.com">
          <Icons.externalLink />
          Link Badge
        </a>
      </Badge>
      <Badge asChild variant="outline">
        <button type="button">
          <Icons.filter />
          Filter
        </button>
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  args: {},
  render: () => (
    <div className="flex items-center gap-2">
      <Badge className="px-1.5 py-0.5 text-xs">Extra Small</Badge>
      <Badge>Default</Badge>
      <Badge className="px-3 py-1 text-sm">Large</Badge>
    </div>
  ),
};

export const WithDots: Story = {
  args: {},
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success">
        <div className="mr-1 size-2 rounded-full bg-current" />
        Online
      </Badge>
      <Badge variant="warning">
        <div className="mr-1 size-2 rounded-full bg-current" />
        Away
      </Badge>
      <Badge variant="error">
        <div className="mr-1 size-2 rounded-full bg-current" />
        Offline
      </Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="grid grid-cols-3 gap-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Light Semantic (New Default)</h3>
        <div className="flex flex-col gap-2">
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Solid (High Attention)</h3>
        <div className="flex flex-col gap-2">
          <Badge variant="success-solid">Success</Badge>
          <Badge variant="warning-solid">Warning</Badge>
          <Badge variant="error-solid">Error</Badge>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Other Variants</h3>
        <div className="flex flex-col gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>
    </div>
  ),
};

export const DesignComparison: Story = {
  args: {},
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-base font-medium">
          New Light Design (Recommended)
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">
            <Icons.check />
            Active
          </Badge>
          <Badge variant="warning">
            <Icons.clock />
            Pending
          </Badge>
          <Badge variant="error">
            <Icons.x />
            Failed
          </Badge>
          <Badge variant="info">
            <Icons.info />
            Info
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          Light backgrounds with colored text - feels modern and lightweight
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-base font-medium">
          Solid Design (High Attention)
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success-solid">
            <Icons.check />
            Active
          </Badge>
          <Badge variant="warning-solid">
            <Icons.clock />
            Pending
          </Badge>
          <Badge variant="error-solid">
            <Icons.x />
            Failed
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          Use solid variants sparingly for high-priority notifications
        </p>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    children: 'Interactive Badge',
    variant: 'default',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Interactive Badge');

    // Test that badge is visible and has correct structure
    expect(badge).toBeInTheDocument();
    expect(badge).toBeVisible();

    // Test that badge has correct data attributes
    expect(badge).toHaveAttribute('data-slot', 'badge');

    // Test that badge has correct styling classes
    expect(badge).toHaveClass('inline-flex', 'items-center', 'justify-center');
    expect(badge).toHaveClass('rounded-md', 'border', 'px-2', 'py-0.5');
    expect(badge).toHaveClass('text-xs', 'font-medium');
  },
};
