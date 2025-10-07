import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Toggle } from '@/components/ui/toggle/toggle';

const meta = {
  argTypes: {
    defaultPressed: {
      control: 'boolean',
      description: 'Default pressed state (uncontrolled)',
      table: {
        type: { summary: 'boolean' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onPressedChange: {
      action: 'pressedChange',
      description: 'Callback when toggle state changes',
      table: {
        type: { summary: '(pressed: boolean) => void' },
      },
    },
    pressed: {
      control: 'boolean',
      description: 'Controlled pressed state',
      table: {
        type: { summary: 'boolean' },
      },
    },
    size: {
      control: { type: 'select' },
      description: 'Size of the toggle button',
      options: ['default', 'sm', 'lg'],
      table: {
        type: { summary: 'default | sm | lg' },
        defaultValue: { summary: 'default' },
      },
    },
    variant: {
      control: { type: 'select' },
      description: 'Visual style variant',
      options: ['default', 'outline'],
      table: {
        type: { summary: 'default | outline' },
        defaultValue: { summary: 'default' },
      },
    },
  },
  component: Toggle,
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A toggle component built on Radix UI that allows users to switch between two states. Fully accessible with keyboard navigation and WCAG AA compliant.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Inputs/Toggle',
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Toggle',
    onPressedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole('button', { name: 'Toggle' });
    expect(toggle).toBeVisible();
    expect(toggle).not.toHaveAttribute('aria-pressed', 'true');

    // Click to toggle on
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(args.onPressedChange).toHaveBeenCalledWith(true);

    // Click to toggle off
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(args.onPressedChange).toHaveBeenCalledWith(false);
  },
};

export const WithIcon: Story = {
  args: {
    'aria-label': 'Toggle activity',
    children: <Icons.activity />,
    onPressedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole('button', { name: 'Toggle activity' });
    expect(toggle).toBeVisible();

    await userEvent.click(toggle);
    expect(args.onPressedChange).toHaveBeenCalledWith(true);
  },
};

export const WithIconAndText: Story = {
  args: {
    children: (
      <>
        <Icons.activity />
        Activity
      </>
    ),
    onPressedChange: fn(),
  },
};

export const Sizes: Story = {
  args: {},
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggles = canvas.getAllByRole('button');
    expect(toggles).toHaveLength(3);

    expect(canvas.getByRole('button', { name: 'Small' })).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Default' })).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Large' })).toBeVisible();
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle size="sm">Small</Toggle>
      <Toggle size="default">Default</Toggle>
      <Toggle size="lg">Large</Toggle>
    </div>
  ),
};

export const Variants: Story = {
  args: {},
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('button', { name: 'Default' })).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Outline' })).toBeVisible();
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle variant="default">Default</Toggle>
      <Toggle variant="outline">Outline</Toggle>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    onPressedChange: fn(),
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole('button', { name: 'Disabled' });
    expect(toggle).toBeDisabled();

    // Verify disabled toggle cannot be pressed (don't try to click disabled elements)
    expect(toggle).not.toHaveAttribute('aria-pressed', 'true');
  },
};

export const ControlledExample: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole('button', { name: 'Toggle notifications' });

    // Initially disabled
    expect(canvas.getByText('Notifications are disabled')).toBeVisible();
    expect(canvas.getByText('Current state: OFF')).toBeVisible();

    // Toggle on
    await userEvent.click(toggle);
    expect(canvas.getByText('Notifications are enabled')).toBeVisible();
    expect(canvas.getByText('Current state: ON')).toBeVisible();

    // Toggle off
    await userEvent.click(toggle);
    expect(canvas.getByText('Notifications are disabled')).toBeVisible();
    expect(canvas.getByText('Current state: OFF')).toBeVisible();
  },
  render: () => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Toggle
            aria-label="Toggle notifications"
            pressed={isPressed}
            onPressedChange={setIsPressed}
          >
            <Icons.bell />
          </Toggle>
          <span className="text-sm">
            Notifications are {isPressed ? 'enabled' : 'disabled'}
          </span>
        </div>
        <div className="text-muted-foreground text-xs">
          Current state: {isPressed ? 'ON' : 'OFF'}
        </div>
      </div>
    );
  },
};

export const FormattingToggles: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially no formatting
    expect(canvas.getByText('Active formatting: None')).toBeVisible();

    // Toggle bold
    const boldToggle = canvas.getByRole('button', { name: 'Toggle bold' });
    await userEvent.click(boldToggle);
    expect(canvas.getByText('Active formatting: Bold')).toBeVisible();

    // Toggle italic
    const italicToggle = canvas.getByRole('button', { name: 'Toggle italic' });
    await userEvent.click(italicToggle);
    expect(canvas.getByText('Active formatting: Bold, Italic')).toBeVisible();

    // Toggle underline
    const underlineToggle = canvas.getByRole('button', {
      name: 'Toggle underline',
    });
    await userEvent.click(underlineToggle);
    expect(
      canvas.getByText('Active formatting: Bold, Italic, Underline'),
    ).toBeVisible();

    // Turn off bold
    await userEvent.click(boldToggle);
    expect(
      canvas.getByText('Active formatting: Italic, Underline'),
    ).toBeVisible();
  },
  render: () => {
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1 rounded-md border p-1">
          <Toggle
            aria-label="Toggle bold"
            pressed={bold}
            size="sm"
            onPressedChange={setBold}
          >
            <Icons.zap />
          </Toggle>
          <Toggle
            aria-label="Toggle italic"
            pressed={italic}
            size="sm"
            onPressedChange={setItalic}
          >
            <Icons.activity />
          </Toggle>
          <Toggle
            aria-label="Toggle underline"
            pressed={underline}
            size="sm"
            onPressedChange={setUnderline}
          >
            <Icons.minus />
          </Toggle>
        </div>
        <div className="text-sm">
          Active formatting:{' '}
          {[bold && 'Bold', italic && 'Italic', underline && 'Underline']
            .filter(Boolean)
            .join(', ') || 'None'}
        </div>
      </div>
    );
  },
};
