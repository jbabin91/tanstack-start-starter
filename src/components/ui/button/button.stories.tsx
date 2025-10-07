import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';

import { Button } from '@/components/ui/button/button';

const meta = {
  argTypes: {
    color: {
      control: { type: 'select' },
      description: 'Color theme and semantic meaning of the button',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    size: {
      control: { type: 'select' },
      description: 'Size affecting height, padding and font size',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    variant: {
      control: { type: 'select' },
      description: 'Visual style variant (filled, outlined, ghost, link)',
      options: ['contained', 'outlined', 'ghost', 'link'],
    },
  },
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'UI/Inputs/Button',
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

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const VariantColorCombinations: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Testing variant and color combinations to identify potential CSS conflicts.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Contained + Colors</h4>
        <div className="flex flex-wrap gap-2">
          <Button color="primary" variant="contained">
            Primary
          </Button>
          <Button color="secondary" variant="contained">
            Secondary
          </Button>
          <Button color="error" variant="contained">
            Error
          </Button>
          <Button color="success" variant="contained">
            Success
          </Button>
          <Button color="warning" variant="contained">
            Warning
          </Button>
          <Button color="info" variant="contained">
            Info
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Ghost + Colors</h4>
        <div className="flex flex-wrap gap-2">
          <Button color="primary" variant="ghost">
            Primary
          </Button>
          <Button color="secondary" variant="ghost">
            Secondary
          </Button>
          <Button color="error" variant="ghost">
            Error
          </Button>
          <Button color="success" variant="ghost">
            Success
          </Button>
          <Button color="warning" variant="ghost">
            Warning
          </Button>
          <Button color="info" variant="ghost">
            Info
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Link + Colors</h4>
        <div className="flex flex-wrap gap-2">
          <Button color="primary" variant="link">
            Primary
          </Button>
          <Button color="secondary" variant="link">
            Secondary
          </Button>
          <Button color="error" variant="link">
            Error
          </Button>
          <Button color="success" variant="link">
            Success
          </Button>
          <Button color="warning" variant="link">
            Warning
          </Button>
          <Button color="info" variant="link">
            Info
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Outlined + Colors</h4>
        <div className="flex flex-wrap gap-2">
          <Button color="primary" variant="outlined">
            Primary
          </Button>
          <Button color="secondary" variant="outlined">
            Secondary
          </Button>
          <Button color="error" variant="outlined">
            Error
          </Button>
          <Button color="success" variant="outlined">
            Success
          </Button>
          <Button color="warning" variant="outlined">
            Warning
          </Button>
          <Button color="info" variant="outlined">
            Info
          </Button>
        </div>
      </div>
    </div>
  ),
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
