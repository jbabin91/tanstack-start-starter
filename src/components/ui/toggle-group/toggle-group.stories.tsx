import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group/toggle-group';

const meta = {
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'Default value for single selection (uncontrolled)',
      table: {
        type: { summary: 'string' },
      },
    },
    onValueChange: {
      action: 'singleValueChange',
      description: 'Callback when single selection changes',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    size: {
      control: { type: 'select' },
      description: 'Size of toggle items',
      options: ['default', 'sm', 'lg'],
      table: {
        type: { summary: 'default | sm | lg' },
        defaultValue: { summary: 'default' },
      },
    },
    type: {
      control: { type: 'select' },
      description: 'Selection mode',
      options: ['single', 'multiple'],
      table: {
        type: { summary: 'single | multiple' },
        defaultValue: { summary: 'single' },
      },
    },
    value: {
      control: 'text',
      description: 'Controlled value for single selection',
      table: {
        type: { summary: 'string' },
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
  component: ToggleGroup,
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
          'A toggle group component built on Radix UI that allows users to select one or multiple options from a group. Supports single and multiple selection modes. WCAG AA compliant.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Inputs/Toggle Group',
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Single: Story = {
  args: {
    type: 'single',
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Check all buttons exist
    const leftBtn = canvas.getByRole('radio', { name: 'Left' });
    const centerBtn = canvas.getByRole('radio', { name: 'Center' });
    const rightBtn = canvas.getByRole('radio', { name: 'Right' });

    expect(leftBtn).toBeVisible();
    expect(centerBtn).toBeVisible();
    expect(rightBtn).toBeVisible();

    // Test single selection
    await userEvent.click(leftBtn);
    expect(args.onValueChange).toHaveBeenCalledWith('left');

    // Clicking another should call with new value
    await userEvent.click(centerBtn);
    expect(args.onValueChange).toHaveBeenCalledWith('center');
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const boldBtn = canvas.getByRole('button', { name: 'Bold' });
    const italicBtn = canvas.getByRole('button', { name: 'Italic' });

    // Test multiple selection
    await userEvent.click(boldBtn);
    expect(args.onValueChange).toHaveBeenCalledWith(['bold']);

    await userEvent.click(italicBtn);
    expect(args.onValueChange).toHaveBeenCalledWith(['bold', 'italic']);

    // Deselecting should remove from array
    await userEvent.click(boldBtn);
    expect(args.onValueChange).toHaveBeenCalledWith(['italic']);
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const WithIcons: Story = {
  args: {
    type: 'single',
    onValueChange: fn(),
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check radio buttons with aria-labels (single type uses radio role)
    expect(canvas.getByRole('radio', { name: 'Align left' })).toBeVisible();
    expect(canvas.getByRole('radio', { name: 'Align center' })).toBeVisible();
    expect(canvas.getByRole('radio', { name: 'Align right' })).toBeVisible();
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem aria-label="Align left" value="left">
        <Icons.chevronLeft />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align center" value="center">
        <Icons.activity />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align right" value="right">
        <Icons.chevronRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const WithIconsAndText: Story = {
  args: {
    type: 'multiple',
    onValueChange: fn(),
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">
        <Icons.zap />
        Bold
      </ToggleGroupItem>
      <ToggleGroupItem value="italic">
        <Icons.activity />
        Italic
      </ToggleGroupItem>
      <ToggleGroupItem value="underline">
        <Icons.minus />
        Underline
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  args: {},
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check all three size groups exist
    const smallButtons = canvas.getAllByText('A');
    expect(smallButtons).toHaveLength(3);

    // Check labels exist
    expect(canvas.getByText('Small')).toBeVisible();
    expect(canvas.getByText('Default')).toBeVisible();
    expect(canvas.getByText('Large')).toBeVisible();
  },
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm font-medium">Small</div>
        <ToggleGroup size="sm" type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Default</div>
        <ToggleGroup size="default" type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Large</div>
        <ToggleGroup size="lg" type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const Variants: Story = {
  args: {},
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check variant labels exist
    expect(canvas.getByText('Default')).toBeVisible();
    expect(canvas.getByText('Outline')).toBeVisible();

    // Check buttons exist in both variants
    const leftButtons = canvas.getAllByText('Left');
    expect(leftButtons).toHaveLength(2);
  },
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm font-medium">Default</div>
        <ToggleGroup type="single" variant="default">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">Outline</div>
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const ControlledSingle: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check initial state
    expect(canvas.getByText('Current alignment: center')).toBeVisible();

    // Click left alignment
    const leftBtn = canvas.getByRole('radio', { name: 'Align left' });
    await userEvent.click(leftBtn);
    expect(canvas.getByText('Current alignment: left')).toBeVisible();

    // Click center again
    const centerBtn = canvas.getByRole('radio', { name: 'Align center' });
    await userEvent.click(centerBtn);
    expect(canvas.getByText('Current alignment: center')).toBeVisible();
  },
  render: () => {
    const [alignment, setAlignment] = useState<string>('center');

    return (
      <div className="space-y-4">
        <div className="text-sm">Current alignment: {alignment || 'none'}</div>
        <ToggleGroup
          type="single"
          value={alignment}
          onValueChange={(value) => setAlignment(value ?? '')}
        >
          <ToggleGroupItem aria-label="Align left" value="left">
            <Icons.chevronLeft />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align center" value="center">
            <Icons.activity />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align right" value="right">
            <Icons.chevronRight />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  },
};

export const ControlledMultiple: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check initial state
    expect(canvas.getByText('Active formatting: bold')).toBeVisible();

    // Add italic
    const italicBtn = canvas.getByRole('button', { name: 'Italic' });
    await userEvent.click(italicBtn);
    expect(canvas.getByText('Active formatting: bold, italic')).toBeVisible();

    // Remove bold
    const boldBtn = canvas.getByRole('button', { name: 'Bold' });
    await userEvent.click(boldBtn);
    expect(canvas.getByText('Active formatting: italic')).toBeVisible();

    // Add underline
    const underlineBtn = canvas.getByRole('button', { name: 'Underline' });
    await userEvent.click(underlineBtn);
    expect(
      canvas.getByText('Active formatting: italic, underline'),
    ).toBeVisible();

    // Remove all
    await userEvent.click(italicBtn);
    await userEvent.click(underlineBtn);
    expect(canvas.getByText('Active formatting: none')).toBeVisible();
  },
  render: () => {
    const [formatting, setFormatting] = useState<string[]>(['bold']);

    return (
      <div className="space-y-4">
        <div className="text-sm">
          Active formatting:{' '}
          {formatting.length > 0 ? formatting.join(', ') : 'none'}
        </div>
        <ToggleGroup
          type="multiple"
          value={formatting}
          onValueChange={setFormatting}
        >
          <ToggleGroupItem value="bold">
            <Icons.zap />
            Bold
          </ToggleGroupItem>
          <ToggleGroupItem value="italic">
            <Icons.activity />
            Italic
          </ToggleGroupItem>
          <ToggleGroupItem value="underline">
            <Icons.minus />
            Underline
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  },
};

export const ViewModeSelector: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check initial state
    expect(canvas.getByText('Current view: grid')).toBeVisible();

    // Switch to list view
    const listBtn = canvas.getByRole('radio', { name: 'List view' });
    await userEvent.click(listBtn);
    expect(canvas.getByText('Current view: list')).toBeVisible();

    // Switch to card view
    const cardBtn = canvas.getByRole('radio', { name: 'Card view' });
    await userEvent.click(cardBtn);
    expect(canvas.getByText('Current view: card')).toBeVisible();
  },
  render: () => {
    const [viewMode, setViewMode] = useState<string>('grid');

    return (
      <div className="space-y-4">
        <div className="text-sm">Current view: {viewMode}</div>
        <ToggleGroup
          type="single"
          value={viewMode}
          variant="outline"
          onValueChange={(value) => setViewMode(value ?? 'grid')}
        >
          <ToggleGroupItem aria-label="List view" value="list">
            <Icons.activity />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Grid view" value="grid">
            <Icons.circle />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Card view" value="card">
            <Icons.file />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  },
};
