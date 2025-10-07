import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider/slider';

const meta = {
  argTypes: {
    defaultValue: {
      control: 'object',
      description: 'Default value(s) of the slider',
      table: {
        type: { summary: 'number[]' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        type: { summary: 'boolean' },
      },
    },
    max: {
      control: 'number',
      description: 'Maximum value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '100' },
      },
    },
    min: {
      control: 'number',
      description: 'Minimum value',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    onValueChange: {
      action: 'valueChange',
      description: 'Callback when slider value changes',
      table: {
        type: { summary: '(value: number[]) => void' },
      },
    },
    orientation: {
      control: { type: 'select' },
      description: 'Orientation of the slider',
      options: ['horizontal', 'vertical'],
      table: {
        type: { summary: 'horizontal | vertical' },
        defaultValue: { summary: 'horizontal' },
      },
    },
    step: {
      control: 'number',
      description: 'Step increment',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    value: {
      control: 'object',
      description: 'Controlled value(s) of the slider',
      table: {
        type: { summary: 'number[]' },
      },
    },
  },
  component: Slider,
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A slider component built on Radix UI that allows users to select a value from a continuous range. Supports single and multiple values, custom ranges, and WCAG AA accessibility standards.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Inputs/Slider',
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const slider = canvas.getByRole('slider');
    expect(slider).toBeVisible();
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');

    // Test keyboard interaction
    await userEvent.click(slider);
    await userEvent.keyboard('{ArrowRight}');
    expect(args.onValueChange).toHaveBeenCalled();
  },
};

export const WithCustomRange: Story = {
  args: {
    defaultValue: [20],
    max: 50,
    min: 10,
    onValueChange: fn(),
    step: 5,
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slider = canvas.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '10');
    expect(slider).toHaveAttribute('aria-valuemax', '50');
    expect(slider).toHaveAttribute('aria-valuenow', '20');
  },
};

export const DualRange: Story = {
  args: {
    defaultValue: [25, 75],
    onValueChange: fn(),
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sliders = canvas.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '25');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '75');
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    disabled: true,
    onValueChange: fn(),
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slider = canvas.getByRole('slider');
    // Check for disabled state - Radix UI uses data-disabled attribute
    expect(slider).toHaveAttribute('data-disabled', '');

    // Check for visual disabled styling
    const sliderContainer = canvasElement.querySelector('[data-slot="slider"]');
    expect(sliderContainer).toHaveAttribute('data-disabled', '');
  },
};

export const Vertical: Story = {
  args: {
    defaultValue: [50],
    onValueChange: fn(),
    orientation: 'vertical',
  },
  decorators: [
    (Story) => (
      <div className="flex h-[300px] items-center justify-center">
        <Story />
      </div>
    ),
  ],
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slider = canvas.getByRole('slider');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  },
};

export const WithLabels: Story = {
  render: () => {
    const [value, setValue] = useState([50]);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="volume-slider">Volume: {value[0]}%</Label>
          <Slider
            id="volume-slider"
            max={100}
            step={1}
            value={value}
            onValueChange={setValue}
          />
        </div>
        <div className="text-muted-foreground text-xs">
          Use arrow keys or drag to adjust volume
        </div>
      </div>
    );
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check slider exists (label association handled by htmlFor/id)
    const slider = canvas.getByRole('slider');
    expect(slider).toBeVisible();

    // Verify the slider has the correct ID for label association
    const sliderContainer = canvasElement.querySelector('#volume-slider');
    expect(sliderContainer).toBeVisible();

    // Check initial value display
    expect(canvas.getByText('Volume: 50%')).toBeVisible();

    // Test instruction text
    expect(
      canvas.getByText('Use arrow keys or drag to adjust volume'),
    ).toBeVisible();
  },
};

export const PriceRange: Story = {
  render: () => {
    const [priceRange, setPriceRange] = useState([100, 500]);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Price Range</Label>
          <Slider
            aria-label="Select price range"
            max={1000}
            min={0}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
          />
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
        <div className="text-sm">
          Selected range: ${priceRange[0]} - ${priceRange[1]}
        </div>
      </div>
    );
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check dual sliders for range
    const sliders = canvas.getAllByRole('slider');
    expect(sliders).toHaveLength(2);

    // Check initial values
    expect(canvas.getByText('$100')).toBeVisible();
    expect(canvas.getByText('$500')).toBeVisible();
    expect(canvas.getByText('Selected range: $100 - $500')).toBeVisible();

    // Test that sliders have proper accessibility labels from Radix
    expect(sliders[0]).toHaveAttribute('aria-label', 'Minimum');
    expect(sliders[1]).toHaveAttribute('aria-label', 'Maximum');
  },
};

export const ControlledExample: Story = {
  render: () => {
    const [brightness, setBrightness] = useState([75]);
    const [contrast, setContrast] = useState([50]);
    const [saturation, setSaturation] = useState([100]);

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="brightness">Brightness: {brightness[0]}%</Label>
          <Slider
            id="brightness"
            max={200}
            step={5}
            value={brightness}
            onValueChange={setBrightness}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contrast">Contrast: {contrast[0]}%</Label>
          <Slider
            id="contrast"
            max={200}
            step={5}
            value={contrast}
            onValueChange={setContrast}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="saturation">Saturation: {saturation[0]}%</Label>
          <Slider
            id="saturation"
            max={200}
            step={5}
            value={saturation}
            onValueChange={setSaturation}
          />
        </div>

        <div className="bg-muted/50 rounded-md border p-4">
          <h3 className="font-medium">Preview</h3>
          <div
            className="mt-2 h-16 w-full rounded-sm bg-gradient-to-r from-blue-500 to-purple-600"
            style={{
              filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`,
            }}
          />
        </div>
      </div>
    );
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check all three sliders exist using their IDs
    const brightnessSlider = canvasElement.querySelector(
      '#brightness [role="slider"]',
    );
    const contrastSlider = canvasElement.querySelector(
      '#contrast [role="slider"]',
    );
    const saturationSlider = canvasElement.querySelector(
      '#saturation [role="slider"]',
    );

    expect(brightnessSlider).toBeVisible();
    expect(contrastSlider).toBeVisible();
    expect(saturationSlider).toBeVisible();

    // Check initial values
    expect(canvas.getByText('Brightness: 75%')).toBeVisible();
    expect(canvas.getByText('Contrast: 50%')).toBeVisible();
    expect(canvas.getByText('Saturation: 100%')).toBeVisible();

    // Check preview exists
    expect(canvas.getByText('Preview')).toBeVisible();
  },
};
