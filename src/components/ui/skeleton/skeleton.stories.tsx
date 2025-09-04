import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';

import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Feedback/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A skeleton component for indicating loading states with animated placeholders. Shows the expected layout structure while content is loading.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      description: 'Additional CSS classes for styling the skeleton.',
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
  render: (args) => <Skeleton className="h-4 w-32" {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Default skeleton with basic dimensions.',
      },
    },
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="space-y-3">
      <Skeleton className="h-3 w-24" {...args} />
      <Skeleton className="h-4 w-32" {...args} />
      <Skeleton className="h-5 w-40" {...args} />
      <Skeleton className="h-6 w-48" {...args} />
      <Skeleton className="h-8 w-56" {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different skeleton sizes for various text and content types.',
      },
    },
  },
};

export const Shapes: Story = {
  render: (args) => (
    <div className="flex items-center space-x-4">
      <Skeleton className="size-12 rounded-full" {...args} />
      <Skeleton className="h-12 w-32 rounded-lg" {...args} />
      <Skeleton className="h-12 w-24 rounded-none" {...args} />
      <Skeleton className="h-12 w-16 rounded-sm" {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different skeleton shapes: circular, rounded, square, and slightly rounded.',
      },
    },
  },
};

export const TextPlaceholders: Story = {
  render: (args) => (
    <div className="w-full max-w-sm space-y-2">
      <Skeleton className="h-6 w-3/4" {...args} />
      <Skeleton className="h-4 w-full" {...args} />
      <Skeleton className="h-4 w-5/6" {...args} />
      <Skeleton className="h-4 w-4/5" {...args} />
      <Skeleton className="h-4 w-2/3" {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Text placeholders simulating paragraph content with varying line lengths.',
      },
    },
  },
};

export const CardLayout: Story = {
  render: (args) => (
    <div className="w-80 space-y-4 rounded-lg border p-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="size-12 rounded-full" {...args} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" {...args} />
          <Skeleton className="h-3 w-1/2" {...args} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" {...args} />
        <Skeleton className="h-4 w-5/6" {...args} />
        <Skeleton className="h-4 w-4/5" {...args} />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" {...args} />
        <Skeleton className="h-8 w-24" {...args} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card layout with avatar, text content, and action buttons.',
      },
    },
  },
};

export const ListItems: Story = {
  render: (args) => (
    <div className="w-full max-w-sm space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`skeleton-list-item-${i}`}
          className="flex items-center space-x-3"
        >
          <Skeleton className="size-10 rounded-full" {...args} />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-3/4" {...args} />
            <Skeleton className="h-3 w-1/2" {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'List of items with avatars and text content.',
      },
    },
  },
};

export const TableLayout: Story = {
  render: (args) => (
    <div className="w-full space-y-3">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-4 w-16" {...args} />
        <Skeleton className="h-4 w-20" {...args} />
        <Skeleton className="h-4 w-18" {...args} />
        <Skeleton className="h-4 w-14" {...args} />
      </div>
      {/* Table Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`skeleton-table-row-${i}`} className="grid grid-cols-4 gap-4">
          <Skeleton className="h-4 w-24" {...args} />
          <Skeleton className="h-4 w-32" {...args} />
          <Skeleton className="h-4 w-20" {...args} />
          <Skeleton className="h-4 w-16" {...args} />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Table layout with header and multiple data rows.',
      },
    },
  },
};

export const ImagePlaceholder: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full" {...args} />
        <Skeleton className="h-32 w-full rounded-lg" {...args} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="aspect-square w-full rounded-md" {...args} />
        <Skeleton className="aspect-square w-full rounded-md" {...args} />
        <Skeleton className="aspect-square w-full rounded-md" {...args} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Image placeholders for different aspect ratios and layouts.',
      },
    },
  },
};

export const FormLayout: Story = {
  render: (args) => (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" {...args} />
        <Skeleton className="h-10 w-full" {...args} />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" {...args} />
        <Skeleton className="h-20 w-full" {...args} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" {...args} />
          <Skeleton className="h-10 w-full" {...args} />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-14" {...args} />
          <Skeleton className="h-10 w-full" {...args} />
        </div>
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-20" {...args} />
        <Skeleton className="h-10 w-24" {...args} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Form layout with labels, inputs, textarea, and buttons.',
      },
    },
  },
};

export const DashboardCards: Story = {
  render: (args) => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`skeleton-dashboard-card-${i}`}
          className="space-y-3 rounded-lg border p-6"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" {...args} />
            <Skeleton className="size-6 rounded-full" {...args} />
          </div>
          <Skeleton className="h-8 w-20" {...args} />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-12" {...args} />
            <Skeleton className="h-3 w-16" {...args} />
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard metric cards with titles, values, and indicators.',
      },
    },
  },
};

export const NavigationMenu: Story = {
  render: (args) => (
    <div className="w-64 space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`skeleton-nav-item-${i}`}
          className="flex items-center space-x-3 p-2"
        >
          <Skeleton className="size-5 rounded-sm" {...args} />
          <Skeleton className="h-4 flex-1" {...args} />
        </div>
      ))}
      <div className="my-4">
        <Skeleton className="h-px w-full" {...args} />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`skeleton-nav-item-bottom-${i}`}
          className="flex items-center space-x-3 p-2"
        >
          <Skeleton className="size-5 rounded-sm" {...args} />
          <Skeleton className="h-4 flex-1" {...args} />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navigation menu with icons, labels, and separator.',
      },
    },
  },
};

export const ProfileHeader: Story = {
  render: (args) => (
    <div className="flex flex-col items-center space-y-4">
      <Skeleton className="size-24 rounded-full" {...args} />
      <div className="space-y-2 text-center">
        <Skeleton className="h-6 w-40" {...args} />
        <Skeleton className="h-4 w-32" {...args} />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-9 w-20" {...args} />
        <Skeleton className="h-9 w-24" {...args} />
      </div>
      <div className="grid grid-cols-3 gap-8 text-center">
        <div className="space-y-1">
          <Skeleton className="mx-auto h-6 w-12" {...args} />
          <Skeleton className="mx-auto h-3 w-16" {...args} />
        </div>
        <div className="space-y-1">
          <Skeleton className="mx-auto h-6 w-12" {...args} />
          <Skeleton className="mx-auto h-3 w-16" {...args} />
        </div>
        <div className="space-y-1">
          <Skeleton className="mx-auto h-6 w-12" {...args} />
          <Skeleton className="mx-auto h-3 w-16" {...args} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Profile header with avatar, name, bio, actions, and stats.',
      },
    },
  },
};

export const CustomStyling: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-medium">Default Animation</h4>
        <Skeleton className="h-4 w-32" {...args} />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Slower Animation</h4>
        <Skeleton className="h-4 w-32 animate-pulse [animation-duration:2s]" />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Custom Color</h4>
        <Skeleton className="h-4 w-32 bg-blue-200 dark:bg-blue-800" />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Shimmer Effect</h4>
        <div className="bg-accent relative h-4 w-32 overflow-hidden rounded-md">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Custom styling options including different animations, colors, and effects.',
      },
    },
  },
};

export const InteractiveSkeleton: Story = {
  render: (args) => (
    <div className="w-full max-w-sm space-y-3">
      <div className="flex items-center space-x-3">
        <Skeleton className="size-10 rounded-full" {...args} />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" {...args} />
          <Skeleton className="h-3 w-1/2" {...args} />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-lg" {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Interactive skeleton for testing animation and visual behavior.',
      },
    },
  },
  play: ({ canvasElement }) => {
    // Find skeletons by their data attribute
    const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(4); // Avatar, title, subtitle, and content

    // Verify all skeletons have the animate-pulse class
    for (const skeleton of skeletons) {
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('bg-accent');
    }

    // Check specific skeleton shapes
    const avatarSkeleton = skeletons[0];
    expect(avatarSkeleton).toHaveClass('rounded-full');
    expect(avatarSkeleton).toHaveClass('h-10');
    expect(avatarSkeleton).toHaveClass('w-10');

    const contentSkeleton = skeletons[3];
    expect(contentSkeleton).toHaveClass('h-20');
    expect(contentSkeleton).toHaveClass('w-full');
    expect(contentSkeleton).toHaveClass('rounded-lg');
  },
};
