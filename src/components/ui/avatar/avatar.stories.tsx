import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import { OverlayBadge } from '@/components/ui/badge/overlay-badge';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta: Meta<typeof Avatar> = {
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes for the avatar container.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
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
  title: 'UI/Data Display/Avatar',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default avatar with image and fallback initials.',
      },
    },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage alt="@shadcn" src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Avatar that displays fallback initials when the image fails to load.',
      },
    },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage alt="@user" src="https://invalid-url.com/nonexistent.jpg" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Avatar with only fallback content, no image provided.',
      },
    },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const CustomFallback: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Avatar with custom styled fallback using emoji or icon.',
      },
    },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback className="bg-blue-500 font-bold text-white">
        👤
      </AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Different avatar sizes using size classes: size-6 (24px), default size-8 (32px), size-12 (48px), and size-16 (64px).',
      },
    },
  },
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
};

export const AvatarGroup: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Group of overlapping avatars with borders, commonly used to show multiple users or team members.',
      },
    },
  },
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
};

export const ProfileCard: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Avatar integrated into a profile card with user information.',
      },
    },
  },
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
};

export const StatusIndicator: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Avatars with integrated status indicators showing online (green), away (yellow), offline (gray), and busy (red) states. Now using the OverlayBadge component for better positioning.',
      },
    },
  },
  play: ({ canvasElement }) => {
    // Status indicators are now badges, use querySelector for data-slot
    const badges = canvasElement.querySelectorAll(
      '[data-slot="overlay-badge"]',
    );
    expect(badges).toHaveLength(4);

    // Verify all badges are visible
    for (const badge of badges) {
      expect(badge).toBeVisible();
    }
  },
  render: (args) => (
    <div className="flex items-center space-x-6">
      <OverlayBadge color="online" overlap="circular" variant="dot">
        <Avatar {...args}>
          <AvatarImage alt="Online user" src="https://github.com/shadcn.png" />
          <AvatarFallback>ON</AvatarFallback>
        </Avatar>
      </OverlayBadge>
      <OverlayBadge color="away" overlap="circular" variant="dot">
        <Avatar {...args}>
          <AvatarImage
            alt="Away user"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
          />
          <AvatarFallback>AW</AvatarFallback>
        </Avatar>
      </OverlayBadge>
      <OverlayBadge color="offline" overlap="circular" variant="dot">
        <Avatar {...args}>
          <AvatarImage
            alt="Offline user"
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
          />
          <AvatarFallback>OF</AvatarFallback>
        </Avatar>
      </OverlayBadge>
      <OverlayBadge color="busy" overlap="circular" variant="dot">
        <Avatar {...args}>
          <AvatarFallback>BY</AvatarFallback>
        </Avatar>
      </OverlayBadge>
    </div>
  ),
};

export const StatusVariations: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates automatic edge positioning using the autoPosition prop. The OverlayBadge dynamically calculates optimal positioning based on the wrapped element's dimensions, ensuring perfect edge placement across all avatar sizes.",
      },
    },
  },
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-medium">Status Sizes</h4>
        <div className="flex items-center space-x-4">
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            variant="dot"
          >
            <Avatar className="size-6" {...args}>
              <AvatarFallback className="text-xs">SM</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            variant="dot"
          >
            <Avatar {...args}>
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            variant="dot"
          >
            <Avatar className="size-12" {...args}>
              <AvatarFallback className="text-lg">LG</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            variant="dot"
          >
            <Avatar className="size-16" {...args}>
              <AvatarFallback className="text-xl">XL</AvatarFallback>
            </Avatar>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium">Status Positions</h4>
        <div className="flex items-center space-x-4">
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            variant="dot"
          >
            <Avatar {...args}>
              <AvatarFallback>BR</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-right"
            color="online"
            overlap="circular"
            variant="dot"
          >
            <Avatar {...args}>
              <AvatarFallback>TR</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-left"
            color="online"
            overlap="circular"
            variant="dot"
          >
            <Avatar {...args}>
              <AvatarFallback>BL</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-left"
            color="online"
            overlap="circular"
            variant="dot"
          >
            <Avatar {...args}>
              <AvatarFallback>TL</AvatarFallback>
            </Avatar>
          </OverlayBadge>
        </div>
      </div>
    </div>
  ),
};

export const SquareAvatar: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Non-circular avatar variations using different border radius values.',
      },
    },
  },
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
};

export const LoadingStates: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Avatar showing loading states with pulse animation effects.',
      },
    },
  },
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
};

export const ColorVariants: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Avatar fallbacks with different color schemes that work in both light and dark themes.',
      },
    },
  },
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
};

export const InteractiveAvatar: Story = {
  args: {
    onClick: fn(),
  },
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
};

export const BadgeVariations: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates badge functionality including count badges, text badges, and different positions using explicit OverlayBadge composition.',
      },
    },
  },
  render: (args) => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-medium">Count Badges</h4>
        <div className="flex items-center space-x-4">
          <OverlayBadge
            badgeContent={5}
            color="error"
            overlap="circular"
            variant="count"
          >
            <Avatar {...args}>
              <AvatarImage
                alt="User with notifications"
                src="https://github.com/shadcn.png"
              />
              <AvatarFallback>5N</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            badgeContent={23}
            color="primary"
            overlap="circular"
            variant="count"
          >
            <Avatar {...args}>
              <AvatarImage
                alt="User with messages"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
              />
              <AvatarFallback>23M</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            badgeContent={99}
            color="success"
            max={99}
            overlap="circular"
            variant="count"
          >
            <Avatar {...args}>
              <AvatarImage
                alt="User with tasks"
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
              />
              <AvatarFallback>99T</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            badgeContent={150}
            color="warning"
            max={99}
            overlap="circular"
            variant="count"
          >
            <Avatar {...args}>
              <AvatarFallback>150</AvatarFallback>
            </Avatar>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium">Text Badges</h4>
        <div className="flex items-center space-x-4">
          <OverlayBadge
            badgeContent="New"
            color="success"
            overlap="circular"
            variant="standard"
          >
            <Avatar {...args}>
              <AvatarImage alt="New user" src="https://github.com/shadcn.png" />
              <AvatarFallback>NU</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            badgeContent="VIP"
            color="warning"
            overlap="circular"
            variant="standard"
          >
            <Avatar {...args}>
              <AvatarImage
                alt="VIP user"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
              />
              <AvatarFallback>VIP</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            badgeContent="Pro"
            color="info"
            overlap="circular"
            variant="standard"
          >
            <Avatar {...args}>
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium">Badge Positions</h4>
        <div className="flex items-center space-x-4">
          <OverlayBadge
            anchorOrigin="top-left"
            badgeContent={1}
            overlap="circular"
            variant="count"
          >
            <Avatar {...args}>
              <AvatarFallback>TL</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-right"
            badgeContent={2}
            overlap="circular"
            variant="count"
          >
            <Avatar {...args}>
              <AvatarFallback>TR</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-left"
            badgeContent={3}
            overlap="circular"
            variant="count"
          >
            <Avatar {...args}>
              <AvatarFallback>BL</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-right"
            badgeContent={4}
            overlap="circular"
            variant="count"
          >
            <Avatar {...args}>
              <AvatarFallback>BR</AvatarFallback>
            </Avatar>
          </OverlayBadge>
        </div>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates accessibility features including descriptive alt text, meaningful fallback content, proper ARIA labels, and accessible badge positioning using OverlayBadge.',
      },
    },
  },
  render: (args) => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Accessibility Features</h4>
      <div className="text-muted-foreground space-y-3 text-xs">
        <p>• Proper alt text for images</p>
        <p>• Meaningful fallback text (initials or abbreviations)</p>
        <p>• Keyboard navigation support for interactive avatars</p>
        <p>• Screen reader friendly role attributes</p>
        <p>• Badge content properly positioned and accessible</p>
      </div>
      <div className="flex items-center space-x-4 pt-2">
        <OverlayBadge color="online" overlap="circular" variant="dot">
          <Avatar {...args}>
            <AvatarImage
              alt="Profile picture of John Doe, Software Engineer"
              src="https://github.com/shadcn.png"
            />
            <AvatarFallback aria-label="John Doe initials">JD</AvatarFallback>
          </Avatar>
        </OverlayBadge>
        <div className="space-y-1">
          <p className="text-sm font-medium">John Doe</p>
          <p className="text-muted-foreground text-xs">
            Descriptive alt text example with status indicator
          </p>
        </div>
      </div>
    </div>
  ),
};
