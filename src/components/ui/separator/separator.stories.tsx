import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator/separator';

const meta: Meta<typeof Separator> = {
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes for styling the separator.',
      table: {
        type: { summary: 'string' },
      },
    },
    decorative: {
      control: { type: 'boolean' },
      description:
        'Whether the separator is purely decorative. When true, it will have no semantic meaning and will not be focusable by assistive technologies.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    orientation: {
      control: { type: 'select' },
      description: 'The orientation of the separator.',
      options: ['horizontal', 'vertical'],
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"horizontal"' },
      },
    },
  },
  component: Separator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A separator component for visually dividing content. Built with Radix UI primitives and provides horizontal and vertical orientations.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Layout/Separator',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Horizontal separator dividing content vertically.',
      },
    },
  },
  render: (args) => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Settings</h4>
        <p className="text-muted-foreground text-sm">
          Configure your account settings
        </p>
      </div>
      <Separator {...args} />
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Privacy</h4>
        <p className="text-muted-foreground text-sm">
          Manage your privacy preferences
        </p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  parameters: {
    docs: {
      description: {
        story: 'Vertical separator dividing content horizontally.',
      },
    },
  },
  render: (args) => (
    <div className="flex h-16 items-center space-x-4">
      <div>
        <h4 className="text-sm font-medium">Home</h4>
      </div>
      <Separator {...args} />
      <div>
        <h4 className="text-sm font-medium">About</h4>
      </div>
      <Separator {...args} />
      <div>
        <h4 className="text-sm font-medium">Contact</h4>
      </div>
    </div>
  ),
};

export const InMenuItems: Story = {
  args: {
    orientation: 'horizontal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Separator used in menu items to group related actions.',
      },
    },
  },
  render: (args) => (
    <div className="w-48 space-y-1 rounded-md border p-2">
      <div className="hover:bg-accent cursor-pointer rounded-sm px-2 py-1.5 text-sm">
        Profile
      </div>
      <div className="hover:bg-accent cursor-pointer rounded-sm px-2 py-1.5 text-sm">
        Settings
      </div>
      <Separator className="my-1" {...args} />
      <div className="hover:bg-accent cursor-pointer rounded-sm px-2 py-1.5 text-sm">
        Help
      </div>
      <div className="hover:bg-accent cursor-pointer rounded-sm px-2 py-1.5 text-sm text-red-600">
        Sign out
      </div>
    </div>
  ),
};

export const InCard: Story = {
  args: {
    orientation: 'horizontal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Separator used in card components to separate sections.',
      },
    },
  },
  render: (args) => (
    <div className="w-80 rounded-lg border shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          This is a description of the card content.
        </p>
      </div>
      <Separator {...args} />
      <div className="p-6">
        <h4 className="mb-2 text-sm font-medium">Details</h4>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>• Item one</li>
          <li>• Item two</li>
          <li>• Item three</li>
        </ul>
      </div>
      <Separator {...args} />
      <div className="p-6">
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outlined">
            Cancel
          </Button>
          <Button size="sm">Confirm</Button>
        </div>
      </div>
    </div>
  ),
};

export const BreadcrumbSeparator: Story = {
  args: {
    decorative: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Vertical separators used in breadcrumb navigation.',
      },
    },
  },
  render: (args) => (
    <nav className="flex items-center space-x-1 text-sm">
      <Button
        className="text-muted-foreground hover:text-foreground h-auto p-0"
        size="sm"
        variant="link"
      >
        Home
      </Button>
      <Separator className="h-4" orientation="vertical" {...args} />
      <Button
        className="text-muted-foreground hover:text-foreground h-auto p-0"
        size="sm"
        variant="link"
      >
        Products
      </Button>
      <Separator className="h-4" orientation="vertical" {...args} />
      <span className="text-foreground font-medium">Laptops</span>
    </nav>
  ),
};

export const StatsGrid: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Using CSS divide utilities with separator styling for stats grids.',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-3 divide-x rounded-lg border">
      <div className="p-6 text-center">
        <div className="text-2xl font-bold">1,234</div>
        <div className="text-muted-foreground text-sm">Total Users</div>
      </div>
      <div className="p-6 text-center">
        <div className="text-2xl font-bold">567</div>
        <div className="text-muted-foreground text-sm">Active Sessions</div>
      </div>
      <div className="p-6 text-center">
        <div className="text-2xl font-bold">89%</div>
        <div className="text-muted-foreground text-sm">Uptime</div>
      </div>
    </div>
  ),
};

export const ListSeparator: Story = {
  args: {
    orientation: 'horizontal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Separator used between list items like notifications.',
      },
    },
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <div className="space-y-0">
        <div className="hover:bg-accent rounded-none p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Notification 1</span>
            <span className="text-muted-foreground text-xs">2m ago</span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Your order has been confirmed
          </p>
        </div>
        <Separator {...args} />
        <div className="hover:bg-accent rounded-none p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Notification 2</span>
            <span className="text-muted-foreground text-xs">5m ago</span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Payment received successfully
          </p>
        </div>
        <Separator {...args} />
        <div className="hover:bg-accent rounded-none p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Notification 3</span>
            <span className="text-muted-foreground text-xs">1h ago</span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            New message from support
          </p>
        </div>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Various styling options for separators including dashed, dotted, thick, colored, and gradient styles.',
      },
    },
  },
  render: () => (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-medium">Default Separator</h4>
        <Separator />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Dashed Separator</h4>
        <Separator className="border-t border-dashed bg-transparent" />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Dotted Separator</h4>
        <Separator className="border-t border-dotted bg-transparent" />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Thick Separator</h4>
        <Separator className="h-0.5" />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Colored Separator</h4>
        <Separator className="bg-blue-500" />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Gradient Separator</h4>
        <Separator className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
      </div>
    </div>
  ),
};

export const SemanticSeparator: Story = {
  args: {
    decorative: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Semantic separator with decorative=false for screen readers and assistive technologies.',
      },
    },
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <article className="space-y-4">
        <section>
          <h2 className="text-lg font-semibold">Article Title</h2>
          <p className="text-muted-foreground text-sm">
            This is the first section of the article content.
          </p>
        </section>
        <Separator decorative={false} role="separator" {...args} />
        <section>
          <h3 className="text-md font-medium">Subsection</h3>
          <p className="text-muted-foreground text-sm">
            This is a subsection with different content that is semantically
            separated.
          </p>
        </section>
      </article>
    </div>
  ),
};

export const ResponsiveSeparator: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Responsive separator that changes orientation based on screen size.',
      },
    },
  },
  render: (args) => (
    <div className="w-full">
      {/* Mobile: horizontal, Desktop: vertical */}
      <div className="flex flex-col items-start space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Mobile View</h4>
          <p className="text-muted-foreground text-xs">
            Stacks vertically on mobile
          </p>
        </div>
        <Separator
          className="w-full md:hidden"
          orientation="horizontal"
          {...args}
        />
        <Separator
          className="hidden h-12 md:block"
          orientation="vertical"
          {...args}
        />
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Desktop View</h4>
          <p className="text-muted-foreground text-xs">
            Flows horizontally on desktop
          </p>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveSeparator: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Basic separator for testing visual rendering and behavior.',
      },
    },
  },
  play: ({ canvasElement }) => {
    // Find separator by its data attribute
    const separator = canvasElement.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();

    // Verify default orientation
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');

    // Verify data slot attribute
    expect(separator).toHaveAttribute('data-slot', 'separator');

    // Verify CSS classes are applied
    expect(separator).toHaveClass('bg-border');
    expect(separator).toHaveClass('shrink-0');
    expect(separator).toHaveClass('data-[orientation=horizontal]:h-px');
    expect(separator).toHaveClass('data-[orientation=horizontal]:w-full');
  },
  render: (args) => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">Basic Content</h4>
        <p className="text-muted-foreground text-sm">
          Some initial content above the separator
        </p>
      </div>
      <Separator {...args} />
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-medium">More Content</h4>
        <p className="text-muted-foreground text-sm">
          Additional content below the separator
        </p>
      </div>
    </div>
  ),
};
