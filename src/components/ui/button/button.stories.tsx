import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';

import { Button } from './button';

const meta = {
  title: 'UI/Inputs/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      description: 'Color theme and semantic meaning of the button',
      control: { type: 'select' },
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    variant: {
      description: 'Visual style variant (filled, outlined, text, link)',
      control: { type: 'select' },
      options: ['contained', 'outlined', 'text', 'link'],
    },
    size: {
      description: 'Size affecting height, padding and font size',
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    color: 'primary',
  },
};

export const Error: Story = {
  args: {
    children: 'Delete Account',
    color: 'error',
  },
};

export const Success: Story = {
  args: {
    children: 'Save Changes',
    color: 'success',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    color: 'secondary',
  },
};

export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Icon: Story = {
  args: {
    children: '🔍',
    size: 'icon',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Outlined Button',
    variant: 'outlined',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    children: 'Click me!',
    onClick: () => console.log('Button clicked!'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /click me!/i });

    // Test that button is visible and accessible
    expect(button).toBeInTheDocument();
    expect(button).toBeVisible();
    expect(button).not.toBeDisabled();

    // Test button interaction
    await userEvent.click(button);

    // Test that button has correct styling
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  },
};
