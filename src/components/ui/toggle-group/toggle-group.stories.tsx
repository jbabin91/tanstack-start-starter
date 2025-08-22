import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';

import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const meta = {
  title: 'UI/Inputs/Toggle Group',
  component: ToggleGroup,
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
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      description: 'Selection mode',
      control: { type: 'select' },
      options: ['single', 'multiple'],
      table: {
        type: { summary: 'single | multiple' },
        defaultValue: { summary: 'single' },
      },
    },
    size: {
      description: 'Size of toggle items',
      control: { type: 'select' },
      options: ['default', 'sm', 'lg'],
      table: {
        type: { summary: 'default | sm | lg' },
        defaultValue: { summary: 'default' },
      },
    },
    variant: {
      description: 'Visual style variant',
      control: { type: 'select' },
      options: ['default', 'outline'],
      table: {
        type: { summary: 'default | outline' },
        defaultValue: { summary: 'default' },
      },
    },
    value: {
      description: 'Controlled value for single selection',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    defaultValue: {
      description: 'Default value for single selection (uncontrolled)',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    onValueChange: {
      description: 'Callback when single selection changes',
      action: 'singleValueChange',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<any>;

export const Single: Story = {
  args: {
    type: 'single',
    onValueChange: fn(),
  },
  render: (args: any) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ args, canvasElement }: any) => {
    const canvas = within(canvasElement);

    // Check all buttons exist
    const leftBtn = canvas.getByRole('button', { name: 'Left' });
    const centerBtn = canvas.getByRole('button', { name: 'Center' });
    const rightBtn = canvas.getByRole('button', { name: 'Right' });

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
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
    onValueChange: fn(),
  },
  render: (args: any) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ args, canvasElement }: any) => {
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
};

export const WithIcons: Story = {
  args: {
    type: 'single',
    onValueChange: fn(),
  },
  render: (args: any) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem aria-label="Align left" value="left">
        <Icons.chevronLeft className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align center" value="center">
        <Icons.activity className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Align right" value="right">
        <Icons.chevronRight className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: ({ canvasElement }: any) => {
    const canvas = within(canvasElement);

    // Check buttons with aria-labels
    expect(canvas.getByRole('button', { name: 'Align left' })).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Align center' })).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Align right' })).toBeVisible();
  },
};

export const WithIconsAndText: Story = {
  args: {
    type: 'multiple',
    onValueChange: fn(),
  },
  render: (args: any) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">
        <Icons.zap className="h-4 w-4" />
        Bold
      </ToggleGroupItem>
      <ToggleGroupItem value="italic">
        <Icons.activity className="h-4 w-4" />
        Italic
      </ToggleGroupItem>
      <ToggleGroupItem value="underline">
        <Icons.minus className="h-4 w-4" />
        Underline
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  args: {},
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
  play: ({ canvasElement }: any) => {
    const canvas = within(canvasElement);

    // Check all three size groups exist
    const smallButtons = canvas.getAllByText('A');
    expect(smallButtons).toHaveLength(3);

    // Check labels exist
    expect(canvas.getByText('Small')).toBeVisible();
    expect(canvas.getByText('Default')).toBeVisible();
    expect(canvas.getByText('Large')).toBeVisible();
  },
};

export const Variants: Story = {
  args: {},
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
  play: ({ canvasElement }: any) => {
    const canvas = within(canvasElement);

    // Check variant labels exist
    expect(canvas.getByText('Default')).toBeVisible();
    expect(canvas.getByText('Outline')).toBeVisible();

    // Check buttons exist in both variants
    const leftButtons = canvas.getAllByText('Left');
    expect(leftButtons).toHaveLength(2);
  },
};

export const ControlledSingle: Story = {
  args: {},
  render: () => {
    const [alignment, setAlignment] = useState<string>('center');

    return (
      <div className="space-y-4">
        <div className="text-sm">Current alignment: {alignment || 'none'}</div>
        <ToggleGroup
          type="single"
          value={alignment}
          onValueChange={(value: any) => setAlignment(value ?? '')}
        >
          <ToggleGroupItem aria-label="Align left" value="left">
            <Icons.chevronLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align center" value="center">
            <Icons.activity className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Align right" value="right">
            <Icons.chevronRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check initial state
    expect(canvas.getByText('Current alignment: center')).toBeVisible();

    // Click left alignment
    const leftBtn = canvas.getByRole('button', { name: 'Align left' });
    await userEvent.click(leftBtn);
    expect(canvas.getByText('Current alignment: left')).toBeVisible();

    // Click center again
    const centerBtn = canvas.getByRole('button', { name: 'Align center' });
    await userEvent.click(centerBtn);
    expect(canvas.getByText('Current alignment: center')).toBeVisible();
  },
};

export const ControlledMultiple: Story = {
  args: {},
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
            <Icons.zap className="h-4 w-4" />
            Bold
          </ToggleGroupItem>
          <ToggleGroupItem value="italic">
            <Icons.activity className="h-4 w-4" />
            Italic
          </ToggleGroupItem>
          <ToggleGroupItem value="underline">
            <Icons.minus className="h-4 w-4" />
            Underline
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  },
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
};

export const ViewModeSelector: Story = {
  args: {},
  render: () => {
    const [viewMode, setViewMode] = useState<string>('grid');

    return (
      <div className="space-y-4">
        <div className="text-sm">Current view: {viewMode}</div>
        <ToggleGroup
          type="single"
          value={viewMode}
          variant="outline"
          onValueChange={(value: any) => setViewMode(value ?? 'grid')}
        >
          <ToggleGroupItem aria-label="List view" value="list">
            <Icons.activity className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Grid view" value="grid">
            <Icons.circle className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Card view" value="card">
            <Icons.file className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check initial state
    expect(canvas.getByText('Current view: grid')).toBeVisible();

    // Switch to list view
    const listBtn = canvas.getByRole('button', { name: 'List view' });
    await userEvent.click(listBtn);
    expect(canvas.getByText('Current view: list')).toBeVisible();

    // Switch to card view
    const cardBtn = canvas.getByRole('button', { name: 'Card view' });
    await userEvent.click(cardBtn);
    expect(canvas.getByText('Current view: card')).toBeVisible();
  },
};
