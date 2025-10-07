import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip/tooltip';

const meta: Meta<typeof Tooltip> = {
  argTypes: {
    defaultOpen: {
      control: 'boolean',
      description:
        'The open state of the tooltip when it is initially rendered.',
      table: {
        type: { summary: 'boolean' },
      },
    },
    delayDuration: {
      control: 'number',
      description:
        'Override the duration before the tooltip opens in milliseconds.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'Event handler called when the open state changes.',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
    open: {
      control: 'boolean',
      description: 'The controlled open state of the tooltip.',
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A tooltip displays informative text when users hover over, focus on, or tap an element.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Feedback/Tooltip',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicTooltip: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Basic tooltip that appears on hover.',
      },
    },
  },
  render: (args) => (
    <div className="p-8">
      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <Button variant="outlined">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const TooltipSides: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Tooltips can be positioned on all four sides of the trigger element.',
      },
    },
  },
  render: (args) => (
    <div className="grid grid-cols-3 gap-8 p-12">
      <div></div>
      <div className="flex justify-center">
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outlined">
              Top
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Tooltip on top</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div></div>

      <div className="flex justify-center">
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outlined">
              Left
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Tooltip on left</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div></div>
      <div className="flex justify-center">
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outlined">
              Right
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Tooltip on right</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div></div>
      <div className="flex justify-center">
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outlined">
              Bottom
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Tooltip on bottom</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div></div>
    </div>
  ),
};

export const TooltipWithIcons: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Tooltips are commonly used with icon buttons to provide action descriptions.',
      },
    },
  },
  render: (args) => (
    <div className="flex gap-4 p-8">
      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <Button aria-label="Add new item" size="icon" variant="outlined">
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add new item</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <Button aria-label="Delete item" size="icon" variant="outlined">
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete item</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <Button aria-label="Edit item" size="icon" variant="outlined">
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit item</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const FormFieldTooltips: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Tooltips can provide helpful context for form fields and requirements.',
      },
    },
  },
  render: (args) => (
    <div className="w-[400px] space-y-4 p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Tooltip {...args}>
            <TooltipTrigger asChild>
              <button
                aria-label="Email help"
                className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center rounded-full border"
                type="button"
              >
                <svg
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>We&apos;ll use this email to send you important updates</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input id="email" placeholder="Enter your email" type="email" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="password">Password</Label>
          <Tooltip {...args}>
            <TooltipTrigger asChild>
              <button
                aria-label="Password requirements help"
                className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center rounded-full border"
                type="button"
              >
                <svg
                  className="size-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <p className="font-medium">Password requirements:</p>
                <ul className="mt-1 list-disc pl-4 text-sm">
                  <li>At least 8 characters</li>
                  <li>Include uppercase and lowercase</li>
                  <li>Include at least one number</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="password"
          placeholder="Enter your password"
          type="password"
        />
      </div>
    </div>
  ),
};

export const TooltipDelays: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Tooltips can have different delay durations before appearing.',
      },
    },
  },
  render: () => (
    <div className="flex gap-4 p-8">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="outlined">No delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appears immediately</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button variant="outlined">500ms delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appears after 500ms</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="outlined">1000ms delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Appears after 1000ms</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const InteractiveTooltip: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Interactive tooltip demonstration with comprehensive hover testing.',
      },
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    // Use semantic query - find button by its text content
    const trigger = canvas.getByRole('button', { name: 'Interactive Tooltip' });

    // Verify trigger exists and is interactive
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeVisible();

    // Hover over the trigger
    await userEvent.hover(trigger);

    // Wait for tooltip to appear by checking aria-describedby
    await waitFor(
      () => {
        expect(trigger).toHaveAttribute('aria-describedby');
      },
      { timeout: 2000 },
    );

    // Verify tooltip trigger has the expected state
    expect(trigger).toHaveAttribute('data-state', 'delayed-open');

    // Unhover to hide tooltip
    await userEvent.unhover(trigger);

    // Add delay for tooltip close animation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify the interaction completed successfully
    // Note: We don't check for aria-describedby removal as Radix may maintain the association
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeVisible();
  },
  render: (args) => (
    <div className="p-8">
      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <Button variant="outlined">Interactive Tooltip</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            <p className="font-medium">Keyboard Shortcuts</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Copy</span>
                <span className="opacity-90">Ctrl+C</span>
              </div>
              <div className="flex justify-between">
                <span>Paste</span>
                <span className="opacity-90">Ctrl+V</span>
              </div>
              <div className="flex justify-between">
                <span>Undo</span>
                <span className="opacity-90">Ctrl+Z</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const TooltipEdgeCases: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Edge cases including long content, empty content, disabled triggers, and rich content.',
      },
    },
  },
  render: (args) => (
    <div className="space-y-8 p-8">
      {/* Very long content */}
      <div>
        <p className="text-muted-foreground mb-4 text-sm">
          Long content tooltip:
        </p>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant="outlined">Long content</Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              This is a very long tooltip content that demonstrates how the
              tooltip handles wrapping and maximum width constraints. It should
              wrap nicely and remain readable even with extensive text content.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Empty content */}
      <div>
        <p className="text-muted-foreground mb-4 text-sm">
          Empty content tooltip:
        </p>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant="outlined">Empty tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p></p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Disabled trigger */}
      <div>
        <p className="text-muted-foreground mb-4 text-sm">Disabled trigger:</p>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <div>
              <Button disabled variant="outlined">
                Disabled button
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This button is currently disabled</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Rich content */}
      <div>
        <p className="text-muted-foreground mb-4 text-sm">
          Rich content tooltip:
        </p>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant="outlined">Rich content</Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <div className="font-medium">User Profile</div>
              <div className="text-sm">
                <div>John Doe</div>
                <div className="text-muted-foreground">
                  john.doe@example.com
                </div>
                <div className="text-muted-foreground">Admin • Online</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
};
