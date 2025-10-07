import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from '@storybook/test';

import { AspectRatio } from '@/components/ui/aspect-ratio/aspect-ratio';

const meta: Meta<typeof AspectRatio> = {
  argTypes: {
    ratio: {
      control: { max: 5, min: 0.1, step: 0.1, type: 'number' },
      description: 'The desired aspect ratio (width / height).',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    children: {
      control: { type: 'text' },
      description: 'Content to display within the aspect ratio container.',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
  },
  component: AspectRatio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A container component that maintains a consistent width-to-height ratio. Perfect for images, videos, and other media content that needs to maintain specific proportions across different screen sizes.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Layout/Aspect Ratio',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ratio: 16 / 9,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default aspect ratio container with 16:9 ratio.',
      },
    },
  },
  render: (args) => (
    <div className="w-80">
      <AspectRatio {...args}>
        <div className="flex h-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
          <span className="text-muted-foreground text-sm">
            16:9 Aspect Ratio
          </span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  args: {
    ratio: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Square aspect ratio (1:1).',
      },
    },
  },
  render: (args) => (
    <div className="w-64">
      <AspectRatio {...args}>
        <div className="flex h-full items-center justify-center rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <span className="text-sm font-medium">1:1 Square</span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  args: {
    ratio: 3 / 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Portrait aspect ratio (3:4), taller than it is wide.',
      },
    },
  },
  render: (args) => (
    <div className="w-48">
      <AspectRatio {...args}>
        <div className="flex h-full items-center justify-center rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <span className="text-center text-sm font-medium">
            3:4
            <br />
            Portrait
          </span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Ultrawide: Story = {
  args: {
    ratio: 21 / 9,
  },
  parameters: {
    docs: {
      description: {
        story: 'Ultrawide aspect ratio (21:9) for cinematic content.',
      },
    },
  },
  render: (args) => (
    <div className="w-96">
      <AspectRatio {...args}>
        <div className="flex h-full items-center justify-center rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <span className="text-sm font-medium">21:9 Ultrawide</span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const CommonRatios: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Common aspect ratios used in different media types.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium">16:9 - Widescreen</h3>
        <div className="w-80">
          <AspectRatio ratio={16 / 9}>
            <div className="flex h-full items-center justify-center rounded-md bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <span className="text-sm">Video / TV</span>
            </div>
          </AspectRatio>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">4:3 - Standard</h3>
        <div className="w-80">
          <AspectRatio ratio={4 / 3}>
            <div className="flex h-full items-center justify-center rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <span className="text-sm">Classic TV / Photos</span>
            </div>
          </AspectRatio>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">1:1 - Square</h3>
        <div className="w-80">
          <AspectRatio ratio={1}>
            <div className="flex h-full items-center justify-center rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span className="text-sm">Social Media</span>
            </div>
          </AspectRatio>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">9:16 - Vertical</h3>
        <div className="w-48">
          <AspectRatio ratio={9 / 16}>
            <div className="flex h-full items-center justify-center rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <span className="text-center text-sm">
                Stories /
                <br />
                Mobile Video
              </span>
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  ),
};

export const WithImages: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Aspect ratio containers with actual images.',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-medium">Landscape Image</h3>
        <div className="w-full">
          <AspectRatio ratio={16 / 9}>
            <img
              alt="Landscape"
              className="size-full rounded-md object-cover"
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop"
            />
          </AspectRatio>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Square Image</h3>
        <div className="w-full">
          <AspectRatio ratio={1}>
            <img
              alt="Square"
              className="size-full rounded-md object-cover"
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop"
            />
          </AspectRatio>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Portrait Image</h3>
        <div className="w-64">
          <AspectRatio ratio={3 / 4}>
            <img
              alt="Portrait"
              className="size-full rounded-md object-cover"
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=400&fit=crop"
            />
          </AspectRatio>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Cinematic</h3>
        <div className="w-full">
          <AspectRatio ratio={21 / 9}>
            <img
              alt="Cinematic"
              className="size-full rounded-md object-cover"
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=840&h=360&fit=crop"
            />
          </AspectRatio>
        </div>
      </div>
    </div>
  ),
};

export const ResponsiveAspectRatio: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Responsive aspect ratio that scales with its container while maintaining proportions.',
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Responsive Container</h3>
      <div className="w-full max-w-2xl">
        <AspectRatio ratio={16 / 9}>
          <div className="flex h-full flex-col items-center justify-center rounded-md bg-gradient-to-br from-blue-400 to-purple-500 text-white">
            <span className="text-lg font-semibold">Responsive 16:9</span>
            <span className="text-sm opacity-75">
              Scales with container width
            </span>
          </div>
        </AspectRatio>
      </div>
      <p className="text-muted-foreground text-xs">
        Resize your browser to see how the aspect ratio is maintained while
        scaling.
      </p>
    </div>
  ),
};

export const VideoPlaceholder: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Video player placeholder using aspect ratio.',
      },
    },
  },
  render: () => (
    <div className="w-full max-w-md">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full flex-col items-center justify-center rounded-md bg-black text-white">
          <div className="mb-2 text-4xl">▶️</div>
          <span className="text-sm">Video Player</span>
          <span className="text-muted-foreground mt-1 text-xs">
            16:9 aspect ratio
          </span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const CardGrid: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Grid of cards using aspect ratio for consistent image sizing.',
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`aspect-card-${i}`}
          className="overflow-hidden rounded-lg border"
        >
          <AspectRatio ratio={16 / 9}>
            <img
              alt={`Card ${i + 1}`}
              className="size-full object-cover"
              src={`https://images.unsplash.com/photo-${
                [
                  '1506905925346-21bda4d32df4',
                  '1441974231531-c6227db76b6e',
                  '1469474968028-56623f02e42e',
                  '1470071459604-8b5ce755599b',
                  '1472099645785-5658abf4ff4e',
                  '1500648767791-00dcc994a43e',
                ][i]
              }?w=320&h=180&fit=crop`}
            />
          </AspectRatio>
          <div className="p-3">
            <h4 className="text-sm font-medium">Card Title {i + 1}</h4>
            <p className="text-muted-foreground mt-1 text-xs">
              Description text here
            </p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const CustomRatios: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Custom aspect ratios including golden ratio and paper formats.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium">Golden Ratio (1.618:1)</h3>
        <div className="w-80">
          <AspectRatio ratio={1.618}>
            <div className="flex h-full items-center justify-center rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <span className="text-sm">φ = 1.618</span>
            </div>
          </AspectRatio>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">A4 Paper (√2:1 ≈ 1.414:1)</h3>
        <div className="w-64">
          <AspectRatio ratio={Math.sqrt(2)}>
            <div className="flex h-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white text-gray-600">
              <span className="text-sm">A4 Format</span>
            </div>
          </AspectRatio>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Custom 5:2</h3>
        <div className="w-80">
          <AspectRatio ratio={5 / 2}>
            <div className="flex h-full items-center justify-center rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              <span className="text-sm">Banner Format</span>
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  ),
};

export const InteractiveAspectRatio: Story = {
  args: {
    ratio: 16 / 9,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive aspect ratio for testing different ratio values.',
      },
    },
  },
  play: ({ canvasElement }) => {
    // Find aspect ratio container by its data attribute
    const aspectRatio = canvasElement.querySelector(
      '[data-slot="aspect-ratio"]',
    );
    expect(aspectRatio).toBeInTheDocument();

    // Verify the aspect ratio container has proper structure
    expect(aspectRatio).toHaveAttribute('data-slot', 'aspect-ratio');

    // Verify child content is present
    const content = aspectRatio?.querySelector('div');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Ratio:');
  },
  render: (args) => (
    <div className="w-80">
      <AspectRatio {...args}>
        <div className="flex h-full items-center justify-center rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <span className="text-sm font-medium">
            Ratio: {args.ratio?.toFixed(2)}
          </span>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates accessibility features and how interactive content works within aspect ratio containers.',
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Accessibility Features</h4>
      <div className="text-muted-foreground space-y-3 text-xs">
        <p>• Maintains aspect ratio while being responsive</p>
        <p>• Content scales properly within the container</p>
        <p>• Works with screen readers and assistive technologies</p>
        <p>• Preserves focus behavior for interactive content</p>
      </div>
      <div className="w-80">
        <AspectRatio ratio={16 / 9}>
          <button
            className="flex size-full items-center justify-center rounded-md bg-gray-100 text-gray-800 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            type="button"
          >
            <span className="text-sm">Interactive Content</span>
          </button>
        </AspectRatio>
      </div>
    </div>
  ),
};
