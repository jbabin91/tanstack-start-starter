import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Data Display/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An avatar component for displaying user profile images with automatic fallback to initials. Built with Radix UI primitives and follows accessibility best practices.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      description: 'Additional CSS classes for the avatar container.',
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
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage alt="@shadcn" src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default avatar with image and fallback initials.',
      },
    },
  },
};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage alt="@user" src="https://invalid-url.com/nonexistent.jpg" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Avatar that displays fallback initials when the image fails to load.',
      },
    },
  },
};

export const FallbackOnly: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with only fallback content, no image provided.',
      },
    },
  },
};

export const CustomFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback className="bg-blue-500 font-bold text-white">
        👤
      </AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with custom styled fallback using emoji or icon.',
      },
    },
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center space-x-4">
      <Avatar className="size-6" {...args}>
        <AvatarImage alt="Small" src="https://github.com/shadcn.png" />
        <AvatarFallback className="text-xs">SM</AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarImage alt="Default" src="https://github.com/shadcn.png" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="size-12" {...args}>
        <AvatarImage alt="Large" src="https://github.com/shadcn.png" />
        <AvatarFallback className="text-lg">LG</AvatarFallback>
      </Avatar>
      <Avatar className="size-16" {...args}>
        <AvatarImage alt="Extra Large" src="https://github.com/shadcn.png" />
        <AvatarFallback className="text-xl">XL</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different avatar sizes using size classes: size-6 (24px), default size-8 (32px), size-12 (48px), and size-16 (64px).',
      },
    },
  },
};

export const AvatarGroup: Story = {
  render: (args) => (
    <div className="flex -space-x-2">
      <Avatar className="border-background border-2" {...args}>
        <AvatarImage alt="User 1" src="https://github.com/shadcn.png" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2" {...args}>
        <AvatarImage
          alt="User 2"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
        />
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2" {...args}>
        <AvatarImage
          alt="User 3"
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
        />
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
      <Avatar className="border-background bg-muted border-2" {...args}>
        <AvatarFallback className="text-xs">+3</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Group of overlapping avatars with borders, commonly used to show multiple users or team members.',
      },
    },
  },
};

export const ProfileCard: Story = {
  render: (args) => (
    <div className="flex items-center space-x-4">
      <Avatar className="size-16" {...args}>
        <AvatarImage
          alt="John Doe"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
        />
        <AvatarFallback className="text-lg font-semibold">JD</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm leading-none font-semibold">John Doe</h4>
        <p className="text-muted-foreground text-sm">
          Software Engineer at Acme Inc.
        </p>
        <p className="text-muted-foreground text-xs">john.doe@acme.com</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar integrated into a profile card with user information.',
      },
    },
  },
};

export const StatusIndicator: Story = {
  render: (args) => (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <Avatar {...args}>
          <AvatarImage alt="Online user" src="https://github.com/shadcn.png" />
          <AvatarFallback>ON</AvatarFallback>
        </Avatar>
        <div className="border-background absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 bg-green-500" />
      </div>
      <div className="relative">
        <Avatar {...args}>
          <AvatarImage
            alt="Away user"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
          />
          <AvatarFallback>AW</AvatarFallback>
        </Avatar>
        <div className="border-background absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 bg-yellow-500" />
      </div>
      <div className="relative">
        <Avatar {...args}>
          <AvatarImage
            alt="Offline user"
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
          />
          <AvatarFallback>OF</AvatarFallback>
        </Avatar>
        <div className="border-background absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 bg-gray-500" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Avatars with status indicators showing online (green), away (yellow), and offline (gray) states.',
      },
    },
  },
};

export const SquareAvatar: Story = {
  render: (args) => (
    <div className="flex items-center space-x-4">
      <Avatar className="rounded-lg" {...args}>
        <AvatarImage alt="Square avatar" src="https://github.com/shadcn.png" />
        <AvatarFallback className="rounded-lg">SQ</AvatarFallback>
      </Avatar>
      <Avatar className="rounded-none" {...args}>
        <AvatarImage alt="No radius" src="https://github.com/shadcn.png" />
        <AvatarFallback className="rounded-none">NR</AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Non-circular avatar variations using different border radius values.',
      },
    },
  },
};

export const LoadingStates: Story = {
  render: (args) => (
    <div className="flex items-center space-x-4">
      <Avatar {...args}>
        <AvatarImage
          alt="Loading"
          src="https://slow-loading-image.com/image.jpg"
        />
        <AvatarFallback className="animate-pulse">LD</AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarFallback className="animate-pulse bg-gray-200">
          <div className="size-4 rounded-full bg-gray-300" />
        </AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar showing loading states with pulse animation effects.',
      },
    },
  },
};

export const ColorVariants: Story = {
  render: (args) => (
    <div className="flex items-center space-x-4">
      <Avatar {...args}>
        <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
          R
        </AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
          B
        </AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
          G
        </AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
          P
        </AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100">
          O
        </AvatarFallback>
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Avatar fallbacks with different color schemes that work in both light and dark themes.',
      },
    },
  },
};

export const InteractiveAvatar: Story = {
  args: {
    onClick: fn(),
  },
  render: (args) => (
    <Avatar
      className="hover:ring-ring cursor-pointer transition-all hover:ring-2 hover:ring-offset-2"
      role="button"
      tabIndex={0}
      {...args}
    >
      <AvatarImage
        alt="Interactive avatar"
        src="https://github.com/shadcn.png"
      />
      <AvatarFallback>IA</AvatarFallback>
    </Avatar>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Interactive avatar that can be clicked, with hover effects and keyboard navigation.',
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Find avatar by role
    const avatar = canvas.getByRole('button');
    expect(avatar).toBeInTheDocument();

    // Test hover effect (visual feedback)
    expect(avatar).toHaveClass('cursor-pointer');
    expect(avatar).toHaveClass('transition-all');

    // Test click interaction
    await userEvent.click(avatar);
    expect(args.onClick).toHaveBeenCalled();

    // Test keyboard navigation
    avatar.focus();
    expect(avatar).toHaveFocus();

    // Verify the avatar is accessible via keyboard
    expect(avatar).toHaveAttribute('tabindex', '0');
    expect(avatar).toHaveAttribute('role', 'button');
  },
};

export const AccessibilityDemo: Story = {
  render: (args) => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Accessibility Features</h4>
      <div className="text-muted-foreground space-y-3 text-xs">
        <p>• Proper alt text for images</p>
        <p>• Meaningful fallback text (initials or abbreviations)</p>
        <p>• Keyboard navigation support for interactive avatars</p>
        <p>• Screen reader friendly role attributes</p>
      </div>
      <div className="flex items-center space-x-4 pt-2">
        <Avatar {...args}>
          <AvatarImage
            alt="Profile picture of John Doe, Software Engineer"
            src="https://github.com/shadcn.png"
          />
          <AvatarFallback aria-label="John Doe initials">JD</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium">John Doe</p>
          <p className="text-muted-foreground text-xs">
            Descriptive alt text example
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates accessibility features including descriptive alt text, meaningful fallback content, and proper ARIA labels.',
      },
    },
  },
};
