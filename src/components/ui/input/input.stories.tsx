import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { Input } from './input';

const meta = {
  title: 'UI/Inputs/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'date',
        'time',
        'file',
      ],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    placeholder: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" placeholder="Enter your email" type="email" />
    </div>
  ),
};

export const Password: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" placeholder="Enter your password" type="password" />
    </div>
  ),
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number',
    min: 0,
    max: 100,
  },
};

export const Search: Story = {
  render: () => (
    <div className="relative">
      <Icons.search className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
      <Input className="pl-9" placeholder="Search..." type="search" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <Icons.mail className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
      <Input className="pl-9" placeholder="Enter your email" type="email" />
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input placeholder="Enter your email" type="email" />
      <Button>Subscribe</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
    value: 'Cannot edit this',
  },
};

export const Invalid: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="invalid-email">Email</Label>
      <Input
        aria-describedby="email-error"
        aria-invalid="true"
        id="invalid-email"
        placeholder="Enter your email"
        type="email"
      />
      <p className="text-error text-sm" id="email-error">
        Please enter a valid email address
      </p>
    </div>
  ),
};

export const File: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Upload File</Label>
      <Input accept=".jpg,.jpeg,.png,.pdf" id="file-upload" type="file" />
      <p className="text-muted-foreground text-xs">
        Accepts JPG, PNG, or PDF files
      </p>
    </div>
  ),
};

export const Date: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="date">Select Date</Label>
      <Input id="date" type="date" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Default Size</Label>
        <Input placeholder="Default input" />
      </div>
      <div className="space-y-2">
        <Label>Small</Label>
        <Input className="h-8 px-2 text-sm" placeholder="Small input" />
      </div>
      <div className="space-y-2">
        <Label>Large</Label>
        <Input className="h-11 px-4 text-base" placeholder="Large input" />
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState('');

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="controlled">Controlled Input</Label>
          <Input
            id="controlled"
            placeholder="Type something..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="text-muted-foreground text-sm">
          Current value: &quot;{value}&quot;
        </div>
        <Button size="sm" variant="outlined" onClick={() => setValue('')}>
          Clear
        </Button>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="interactive-input">Interactive Input</Label>
      <Input id="interactive-input" placeholder="Click to focus and type" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Interactive Input');

    // Test that input is visible and accessible
    expect(input).toBeInTheDocument();
    expect(input).toBeVisible();
    expect(input).not.toBeDisabled();

    // Test input focus
    await userEvent.click(input);
    expect(input).toHaveFocus();

    // Test typing
    await userEvent.type(input, 'Hello World!');
    expect(input).toHaveValue('Hello World!');

    // Test clearing
    await userEvent.clear(input);
    expect(input).toHaveValue('');

    // Test attributes
    expect(input).toHaveAttribute('data-slot', 'input');
  },
};
