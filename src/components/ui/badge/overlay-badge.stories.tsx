import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icons } from '@/components/icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar/avatar';
import { Button } from '@/components/ui/button';

import { OverlayBadge } from './overlay-badge';

const meta: Meta<typeof OverlayBadge> = {
  title: 'UI/Data Display/Overlay Badge',
  component: OverlayBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An overlay badge component that can wrap any content to display status indicators, counts, or custom content. Similar to MUI Badge component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Badge variant style',
      control: { type: 'select' },
      options: ['dot', 'count', 'standard'],
    },
    color: {
      description: 'Badge color theme',
      control: { type: 'select' },
      options: [
        'primary',
        'secondary',
        'error',
        'success',
        'warning',
        'info',
        'online',
        'away',
        'offline',
        'busy',
      ],
    },
    anchorOrigin: {
      description: 'Badge position relative to child',
      control: { type: 'select' },
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
    overlap: {
      description: 'How badge overlaps with child content',
      control: { type: 'select' },
      options: ['rectangular', 'circular'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    badgeContent: 4,
  },
  render: (args) => (
    <OverlayBadge {...args}>
      <Button variant="outlined">Messages</Button>
    </OverlayBadge>
  ),
};

export const WithAvatar: Story = {
  args: {
    badgeContent: 8,
    color: 'error',
    anchorOrigin: 'top-right',
    overlap: 'circular',
    spacing: 'loose',
  },
  render: (args) => (
    <OverlayBadge {...args}>
      <Avatar>
        <AvatarImage alt="@user" src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </OverlayBadge>
  ),
};

export const StatusDots: Story = {
  render: () => (
    <div className="flex items-center space-x-8">
      <OverlayBadge
        anchorOrigin="bottom-right"
        color="online"
        overlap="circular"
        srLabel="Online"
        variant="dot"
      >
        <Avatar>
          <AvatarImage alt="Online user" src="https://github.com/shadcn.png" />
          <AvatarFallback>ON</AvatarFallback>
        </Avatar>
      </OverlayBadge>
      <OverlayBadge
        anchorOrigin="bottom-right"
        color="away"
        overlap="circular"
        srLabel="Away"
        variant="dot"
      >
        <Avatar>
          <AvatarImage
            alt="Away user"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
          />
          <AvatarFallback>AW</AvatarFallback>
        </Avatar>
      </OverlayBadge>
      <OverlayBadge
        anchorOrigin="bottom-right"
        color="offline"
        overlap="circular"
        srLabel="Offline"
        variant="dot"
      >
        <Avatar>
          <AvatarImage
            alt="Offline user"
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
          />
          <AvatarFallback>OF</AvatarFallback>
        </Avatar>
      </OverlayBadge>
      <OverlayBadge
        anchorOrigin="bottom-right"
        color="busy"
        overlap="circular"
        srLabel="Busy"
        variant="dot"
      >
        <Avatar>
          <AvatarFallback>BY</AvatarFallback>
        </Avatar>
      </OverlayBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Status indicator dots positioned on avatars with screen reader support, similar to online/offline indicators.',
      },
    },
  },
};

export const CountBadges: Story = {
  render: () => (
    <div className="flex items-center space-x-8">
      <OverlayBadge badgeContent={5} color="error">
        <Button variant="outlined">
          <Icons.bell className="h-4 w-4" />
          Notifications
        </Button>
      </OverlayBadge>
      <OverlayBadge badgeContent={23} color="primary">
        <Button variant="outlined">
          <Icons.mail className="h-4 w-4" />
          Messages
        </Button>
      </OverlayBadge>
      <OverlayBadge badgeContent={99} color="success" max={99}>
        <Button variant="outlined">
          <Icons.checkCircle className="h-4 w-4" />
          Completed
        </Button>
      </OverlayBadge>
      <OverlayBadge badgeContent={150} color="warning" max={99}>
        <Button variant="outlined">
          <Icons.alertTriangle className="h-4 w-4" />
          Warnings
        </Button>
      </OverlayBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Count badges showing numbers with max value truncation (99+).',
      },
    },
  },
};

export const NestedAvatars: Story = {
  render: () => (
    <div className="flex items-center space-x-8">
      {/* Small avatar badge */}
      <OverlayBadge
        anchorOrigin="bottom-right"
        badgeContent={
          <Avatar className="border-background h-4 w-4 border">
            <AvatarImage
              alt="Badge user"
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=16&h=16&fit=crop&crop=face"
            />
            <AvatarFallback className="text-xs">B</AvatarFallback>
          </Avatar>
        }
        overlap="circular"
        variant="standard"
      >
        <Avatar className="h-12 w-12">
          <AvatarImage alt="Main user" src="https://github.com/shadcn.png" />
          <AvatarFallback>MU</AvatarFallback>
        </Avatar>
      </OverlayBadge>

      {/* Text badge */}
      <OverlayBadge
        anchorOrigin="top-right"
        badgeContent="New"
        color="success"
        overlap="circular"
        variant="standard"
      >
        <Avatar className="h-12 w-12">
          <AvatarImage
            alt="New user"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
          />
          <AvatarFallback>NU</AvatarFallback>
        </Avatar>
      </OverlayBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom badge content including nested avatars and text labels.',
      },
    },
  },
};

export const Positions: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-4 text-sm font-medium">Rectangular Overlap</h4>
        <div className="flex items-center space-x-6">
          <OverlayBadge
            anchorOrigin="top-left"
            badgeContent={1}
            overlap="rectangular"
          >
            <Button className="h-16 w-20" variant="outlined">
              Top Left
            </Button>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-right"
            badgeContent={2}
            overlap="rectangular"
          >
            <Button className="h-16 w-20" variant="outlined">
              Top Right
            </Button>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-left"
            badgeContent={3}
            overlap="rectangular"
          >
            <Button className="h-16 w-20" variant="outlined">
              Bottom Left
            </Button>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-right"
            badgeContent={4}
            overlap="rectangular"
          >
            <Button className="h-16 w-20" variant="outlined">
              Bottom Right
            </Button>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-sm font-medium">Circular Overlap</h4>
        <div className="flex items-center space-x-6">
          <OverlayBadge
            anchorOrigin="top-left"
            badgeContent={1}
            overlap="circular"
          >
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">TL</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-right"
            badgeContent={2}
            overlap="circular"
          >
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">TR</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-left"
            badgeContent={3}
            overlap="circular"
          >
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">BL</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="bottom-right"
            badgeContent={4}
            overlap="circular"
          >
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">BR</AvatarFallback>
            </Avatar>
          </OverlayBadge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different badge positions and overlap styles for rectangular and circular content.',
      },
    },
  },
};

export const VariantShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-4 text-sm font-medium">Dot Variant</h4>
        <div className="flex items-center space-x-4">
          <OverlayBadge color="error" variant="dot">
            <Button variant="outlined">Error</Button>
          </OverlayBadge>
          <OverlayBadge color="success" variant="dot">
            <Button variant="outlined">Success</Button>
          </OverlayBadge>
          <OverlayBadge color="warning" variant="dot">
            <Button variant="outlined">Warning</Button>
          </OverlayBadge>
          <OverlayBadge color="info" variant="dot">
            <Button variant="outlined">Info</Button>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-sm font-medium">Count Variant</h4>
        <div className="flex items-center space-x-4">
          <OverlayBadge badgeContent={5} color="error" variant="count">
            <Button variant="outlined">Error</Button>
          </OverlayBadge>
          <OverlayBadge badgeContent={12} color="success" variant="count">
            <Button variant="outlined">Success</Button>
          </OverlayBadge>
          <OverlayBadge badgeContent={8} color="warning" variant="count">
            <Button variant="outlined">Warning</Button>
          </OverlayBadge>
          <OverlayBadge badgeContent={3} color="info" variant="count">
            <Button variant="outlined">Info</Button>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-sm font-medium">Standard Variant</h4>
        <div className="flex items-center space-x-4">
          <OverlayBadge
            anchorOrigin="top-right"
            badgeContent="NEW"
            color="error"
            spacing="normal"
            variant="standard"
          >
            <Button variant="outlined">Error</Button>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-right"
            badgeContent="LIVE"
            color="success"
            spacing="normal"
            variant="standard"
          >
            <Button variant="outlined">Success</Button>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-right"
            badgeContent="HOT"
            color="warning"
            spacing="normal"
            variant="standard"
          >
            <Button variant="outlined">Warning</Button>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-right"
            badgeContent="BETA"
            color="info"
            spacing="normal"
            variant="standard"
          >
            <Button variant="outlined">Info</Button>
          </OverlayBadge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All three badge variants: dot (minimal indicator), count (numbers), and standard (text labels).',
      },
    },
  },
};

export const ZeroHandling: Story = {
  render: () => (
    <div className="flex items-center space-x-8">
      <OverlayBadge badgeContent={0} showZero={false}>
        <Button variant="outlined">Hidden Zero</Button>
      </OverlayBadge>
      <OverlayBadge badgeContent={0} showZero={true}>
        <Button variant="outlined">Shown Zero</Button>
      </OverlayBadge>
      <OverlayBadge badgeContent={0} color="success" showZero={true}>
        <Button variant="outlined">Success Zero</Button>
      </OverlayBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Zero value handling with showZero prop to control visibility.',
      },
    },
  },
};

export const InvisibleBadge: Story = {
  render: () => (
    <div className="flex items-center space-x-8">
      <OverlayBadge badgeContent={5} invisible={false}>
        <Button variant="outlined">Visible Badge</Button>
      </OverlayBadge>
      <OverlayBadge badgeContent={5} invisible={true}>
        <Button variant="outlined">Invisible Badge</Button>
      </OverlayBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Control badge visibility with the invisible prop.',
      },
    },
  },
};

export const SpacingVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-4 text-sm font-medium">Tight Spacing (Default)</h4>
        <div className="flex items-center space-x-6">
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            spacing="tight"
            srLabel="Online"
            variant="dot"
          >
            <Avatar className="size-10">
              <AvatarFallback>TI</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge badgeContent={5} color="error" spacing="tight">
            <Button variant="outlined">Tight</Button>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-sm font-medium">Normal Spacing</h4>
        <div className="flex items-center space-x-6">
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            spacing="normal"
            srLabel="Online"
            variant="dot"
          >
            <Avatar className="size-10">
              <AvatarFallback>NO</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge badgeContent={5} color="error" spacing="normal">
            <Button variant="outlined">Normal</Button>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-sm font-medium">Loose Spacing</h4>
        <div className="flex items-center space-x-6">
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            spacing="loose"
            srLabel="Online"
            variant="dot"
          >
            <Avatar className="size-10">
              <AvatarFallback>LO</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge badgeContent={5} color="error" spacing="loose">
            <Button variant="outlined">Loose</Button>
          </OverlayBadge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Different spacing options for fine-tuning badge positioning based on your design needs.',
      },
    },
  },
};

export const DebugAllCombinations: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Rectangular Overlap - All Variants & Spacings */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Rectangular Overlap</h3>
        {/* Dot Variant */}
        <div className="mb-6">
          <h4 className="text-muted-foreground mb-3 text-sm font-medium">
            Dot Variant
          </h4>
          <div className="space-y-4">
            {(['tight', 'normal', 'loose'] as const).map((spacing) => (
              <div key={spacing}>
                <h5 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
                  {spacing} spacing
                </h5>
                <div className="flex items-center justify-center space-x-12">
                  {(
                    [
                      'top-right',
                      'top-left',
                      'bottom-right',
                      'bottom-left',
                    ] as const
                  ).map((anchor) => (
                    <div
                      key={anchor}
                      className="flex flex-col items-center space-y-3"
                    >
                      <OverlayBadge
                        anchorOrigin={anchor}
                        color="error"
                        overlap="rectangular"
                        spacing={spacing}
                        variant="dot"
                      >
                        <Button size="sm" variant="outlined">
                          {anchor.replace('-', ' ')}
                        </Button>
                      </OverlayBadge>
                      <span className="text-muted-foreground text-xs">
                        {anchor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Count Variant */}
        <div className="mb-6">
          <h4 className="text-muted-foreground mb-3 text-sm font-medium">
            Count Variant
          </h4>
          <div className="space-y-4">
            {(['tight', 'normal', 'loose'] as const).map((spacing) => (
              <div key={spacing}>
                <h5 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
                  {spacing} spacing
                </h5>
                <div className="flex items-center justify-center space-x-12">
                  {(
                    [
                      'top-right',
                      'top-left',
                      'bottom-right',
                      'bottom-left',
                    ] as const
                  ).map((anchor) => (
                    <div
                      key={anchor}
                      className="flex flex-col items-center space-y-3"
                    >
                      <OverlayBadge
                        anchorOrigin={anchor}
                        badgeContent={9}
                        color="primary"
                        overlap="rectangular"
                        spacing={spacing}
                        variant="count"
                      >
                        <Button size="sm" variant="outlined">
                          {anchor.replace('-', ' ')}
                        </Button>
                      </OverlayBadge>
                      <span className="text-muted-foreground text-xs">
                        {anchor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Variant */}
        <div className="mb-6">
          <h4 className="text-muted-foreground mb-3 text-sm font-medium">
            Standard Variant
          </h4>
          <div className="space-y-4">
            {(['tight', 'normal', 'loose'] as const).map((spacing) => (
              <div key={spacing}>
                <h5 className="text-muted-foreground mb-6 text-xs font-medium tracking-wider uppercase">
                  {spacing} spacing
                </h5>
                <div className="flex items-center justify-center space-x-14">
                  {(
                    [
                      'top-right',
                      'top-left',
                      'bottom-right',
                      'bottom-left',
                    ] as const
                  ).map((anchor) => (
                    <div
                      key={anchor}
                      className="flex flex-col items-center space-y-3"
                    >
                      <OverlayBadge
                        anchorOrigin={anchor}
                        badgeContent="NEW"
                        color="success"
                        overlap="rectangular"
                        spacing={spacing}
                        variant="standard"
                      >
                        <Button size="sm" variant="outlined">
                          {anchor.replace('-', ' ')}
                        </Button>
                      </OverlayBadge>
                      <span className="text-muted-foreground text-xs">
                        {anchor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Circular Overlap - All Variants & Spacings */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Circular Overlap</h3>
        {/* Dot Variant */}
        <div className="mb-6">
          <h4 className="text-muted-foreground mb-3 text-sm font-medium">
            Dot Variant
          </h4>
          <div className="space-y-4">
            {(['tight', 'normal', 'loose'] as const).map((spacing) => (
              <div key={spacing}>
                <h5 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
                  {spacing} spacing
                </h5>
                <div className="flex items-center justify-center space-x-12">
                  {(
                    [
                      'top-right',
                      'top-left',
                      'bottom-right',
                      'bottom-left',
                    ] as const
                  ).map((anchor) => (
                    <div
                      key={anchor}
                      className="flex flex-col items-center space-y-3"
                    >
                      <OverlayBadge
                        anchorOrigin={anchor}
                        color="warning"
                        overlap="circular"
                        spacing={spacing}
                        variant="dot"
                      >
                        <Avatar className="size-10">
                          <AvatarFallback className="text-xs">
                            {anchor.charAt(0).toUpperCase()}
                            {anchor.split('-')[1].charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </OverlayBadge>
                      <span className="text-muted-foreground text-xs">
                        {anchor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Count Variant */}
        <div className="mb-6">
          <h4 className="text-muted-foreground mb-3 text-sm font-medium">
            Count Variant
          </h4>
          <div className="space-y-4">
            {(['tight', 'normal', 'loose'] as const).map((spacing) => (
              <div key={spacing}>
                <h5 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
                  {spacing} spacing
                </h5>
                <div className="flex items-center justify-center space-x-12">
                  {(
                    [
                      'top-right',
                      'top-left',
                      'bottom-right',
                      'bottom-left',
                    ] as const
                  ).map((anchor) => (
                    <div
                      key={anchor}
                      className="flex flex-col items-center space-y-3"
                    >
                      <OverlayBadge
                        anchorOrigin={anchor}
                        badgeContent={5}
                        color="info"
                        overlap="circular"
                        spacing={spacing}
                        variant="count"
                      >
                        <Avatar className="size-10">
                          <AvatarFallback className="text-xs">
                            {anchor.charAt(0).toUpperCase()}
                            {anchor.split('-')[1].charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </OverlayBadge>
                      <span className="text-muted-foreground text-xs">
                        {anchor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Variant */}
        <div className="mb-6">
          <h4 className="text-muted-foreground mb-3 text-sm font-medium">
            Standard Variant
          </h4>
          <div className="space-y-4">
            {(['tight', 'normal', 'loose'] as const).map((spacing) => (
              <div key={spacing}>
                <h5 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
                  {spacing} spacing
                </h5>
                <div className="flex items-center justify-center space-x-12">
                  {(
                    [
                      'top-right',
                      'top-left',
                      'bottom-right',
                      'bottom-left',
                    ] as const
                  ).map((anchor) => (
                    <div
                      key={anchor}
                      className="flex flex-col items-center space-y-3"
                    >
                      <OverlayBadge
                        anchorOrigin={anchor}
                        badgeContent="HOT"
                        color="warning"
                        overlap="circular"
                        spacing={spacing}
                        variant="standard"
                      >
                        <Avatar className="size-10">
                          <AvatarFallback className="text-xs">
                            {anchor.charAt(0).toUpperCase()}
                            {anchor.split('-')[1].charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </OverlayBadge>
                      <span className="text-muted-foreground text-xs">
                        {anchor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive debug view showing every combination of variant, spacing, anchor position, and overlap style. Use this to fine-tune positioning and identify edge cases.',
      },
    },
  },
};

export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-4 text-sm font-medium">Shopping Cart with Count</h4>
        <OverlayBadge
          anchorOrigin="top-right"
          badgeContent={8}
          color="error"
          srLabel="8 items in cart"
        >
          <Avatar className="size-9 rounded-sm">
            <AvatarFallback className="rounded-sm">
              <Icons.shoppingCart className="size-5" />
            </AvatarFallback>
          </Avatar>
        </OverlayBadge>
      </div>
      <div>
        <h4 className="mb-4 text-sm font-medium">User Status Indicators</h4>
        <div className="flex items-center space-x-6">
          <OverlayBadge
            anchorOrigin="bottom-right"
            color="online"
            overlap="circular"
            spacing="tight"
            srLabel="Online"
            variant="dot"
          >
            <Avatar className="size-10">
              <AvatarImage
                alt="Hallie Richards"
                src="https://images.unsplash.com/photo-1494790108755-2616b612b510?w=40&h=40&fit=crop&crop=face"
              />
              <AvatarFallback>HR</AvatarFallback>
            </Avatar>
          </OverlayBadge>
          <OverlayBadge
            anchorOrigin="top-right"
            color="away"
            overlap="circular"
            spacing="tight"
            srLabel="Away"
            variant="dot"
          >
            <Avatar className="rounded-sm">
              <AvatarImage
                alt="Alex Johnson"
                className="rounded-sm"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
              />
              <AvatarFallback className="text-xs">AJ</AvatarFallback>
            </Avatar>
          </OverlayBadge>
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-sm font-medium">Notification Badges</h4>
        <div className="flex items-center space-x-6">
          <OverlayBadge
            badgeContent={12}
            color="error"
            srLabel="12 unread messages"
          >
            <Button variant="outlined">
              <Icons.mail className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </OverlayBadge>
          <OverlayBadge
            badgeContent={3}
            color="warning"
            srLabel="3 notifications"
          >
            <Button aria-label="View notifications" size="icon" variant="ghost">
              <Icons.bell className="h-4 w-4" />
            </Button>
          </OverlayBadge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Real-world usage examples showing shopping carts, user status, and notifications with proper accessibility.',
      },
    },
  },
};

export const TextTruncation: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-4 text-sm font-medium">Text Length Examples</h4>
        <div className="flex flex-wrap items-center gap-6">
          {/* Short text - no truncation */}
          <OverlayBadge badgeContent="NEW" color="success" variant="standard">
            <Button variant="outlined">Short Text</Button>
          </OverlayBadge>

          {/* Medium text - no truncation */}
          <OverlayBadge
            badgeContent="PREMIUM"
            color="warning"
            variant="standard"
          >
            <Button variant="outlined">Medium Text</Button>
          </OverlayBadge>

          {/* Long text - will truncate with tooltip */}
          <OverlayBadge
            badgeContent="Developer"
            color="info"
            variant="standard"
          >
            <Button variant="outlined">Long Text (hover me)</Button>
          </OverlayBadge>

          {/* Very long text - will truncate with tooltip */}
          <OverlayBadge
            badgeContent="under-development"
            color="secondary"
            variant="standard"
          >
            <Button variant="outlined">Very Long Text (hover me)</Button>
          </OverlayBadge>
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-sm font-medium">
          Different Positions with Long Text
        </h4>
        <div className="flex flex-wrap items-center gap-8">
          <OverlayBadge
            anchorOrigin="top-right"
            badgeContent="EXPERIMENTAL"
            color="warning"
            variant="standard"
          >
            <Button variant="outlined">Top Right</Button>
          </OverlayBadge>

          <OverlayBadge
            anchorOrigin="top-left"
            badgeContent="BETA-VERSION"
            color="info"
            variant="standard"
          >
            <Button variant="outlined">Top Left</Button>
          </OverlayBadge>

          <OverlayBadge
            anchorOrigin="bottom-right"
            badgeContent="DEPRECATED"
            color="error"
            variant="standard"
          >
            <Button variant="outlined">Bottom Right</Button>
          </OverlayBadge>

          <OverlayBadge
            anchorOrigin="bottom-left"
            badgeContent="COMING-SOON"
            color="primary"
            variant="standard"
          >
            <Button variant="outlined">Bottom Left</Button>
          </OverlayBadge>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates automatic text truncation for long badge content. Standard variant badges longer than 8 characters are automatically truncated with ellipsis. Hover over truncated badges to see full text in tooltip.',
      },
    },
  },
};
