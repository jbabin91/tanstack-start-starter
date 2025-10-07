import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import { Icons } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const meta = {
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A label component that renders an accessible label for form elements. Built on top of Radix UI Label with support for disabled states.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Inputs/Label',
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-2">
      <Label {...args}>Email address</Label>
      <Input placeholder="Enter your email" type="email" />
    </div>
  ),
};

export const WithInput: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} htmlFor="email-input">
        Email address
      </Label>
      <Input id="email-input" placeholder="john@example.com" type="email" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  args: {},
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label {...args} htmlFor="terms">
        Accept terms and conditions
      </Label>
    </div>
  ),
};

export const WithRadioGroup: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-4">
      <Label {...args}>Choose your subscription plan</Label>
      <RadioGroup className="space-y-2" defaultValue="monthly">
        <div className="flex items-center space-x-2">
          <RadioGroupItem id="weekly" value="weekly" />
          <Label htmlFor="weekly">Weekly ($5/week)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem id="monthly" value="monthly" />
          <Label htmlFor="monthly">Monthly ($15/month)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem id="yearly" value="yearly" />
          <Label htmlFor="yearly">Yearly ($100/year)</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const WithSwitch: Story = {
  args: {},
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch id="notifications" />
      <Label {...args} htmlFor="notifications">
        Enable notifications
      </Label>
    </div>
  ),
};

export const WithTextarea: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} htmlFor="message">
        Message
      </Label>
      <Textarea id="message" placeholder="Type your message here..." />
    </div>
  ),
};

export const WithIcon: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-2">
      <Label {...args} className="flex items-center gap-2">
        <Icons.user />
        Username
      </Label>
      <Input placeholder="Enter username" />
    </div>
  ),
};

export const Required: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-2">
      <Label {...args}>
        Email address
        <span className="ml-1 text-red-500">*</span>
      </Label>
      <Input required placeholder="Required field" type="email" />
    </div>
  ),
};

export const DisabledField: Story = {
  args: {},
  render: (args) => (
    <div className="group space-y-2" data-disabled="true">
      <Label {...args} htmlFor="disabled-input">
        Disabled field
      </Label>
      <Input
        disabled
        id="disabled-input"
        placeholder="This field is disabled"
      />
    </div>
  ),
};

export const MultipleLabels: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label {...args} htmlFor="first-name">
          First name
        </Label>
        <Input id="first-name" placeholder="John" />
      </div>

      <div className="space-y-2">
        <Label {...args} htmlFor="last-name">
          Last name
        </Label>
        <Input id="last-name" placeholder="Doe" />
      </div>

      <div className="space-y-2">
        <Label {...args} htmlFor="bio">
          Biography
        </Label>
        <Textarea id="bio" placeholder="Tell us about yourself..." />
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Test label click focuses input
    const inputLabel = canvas.getByText('Click me to focus the input');
    const input = canvas.getByPlaceholderText('Focus me when label is clicked');

    await userEvent.click(inputLabel);
    expect(input).toHaveFocus();
    expect(args.onClick).toHaveBeenCalledTimes(1);

    // Test label click toggles checkbox
    const checkboxLabel = canvas.getByText('Click to toggle checkbox');
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Click to toggle checkbox',
    });

    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkboxLabel);
    expect(checkbox).toBeChecked();
    expect(args.onClick).toHaveBeenCalledTimes(2);

    // Test label click toggles switch
    const switchLabel = canvas.getByText('Click to toggle switch');
    const switchElement = canvas.getByRole('switch', {
      name: 'Click to toggle switch',
    });

    expect(switchElement).not.toBeChecked();
    await userEvent.click(switchLabel);
    expect(switchElement).toBeChecked();
    expect(args.onClick).toHaveBeenCalledTimes(3);

    // Test radio button labels
    const option1Label = canvas.getByText('Option 1');
    const option1Radio = canvas.getByRole('radio', { name: 'Option 1' });

    expect(option1Radio).not.toBeChecked();
    await userEvent.click(option1Label);
    expect(option1Radio).toBeChecked();

    // Verify component structure with data attributes
    const labels = canvasElement.querySelectorAll('[data-slot="label"]');
    expect(labels.length).toBeGreaterThan(0);
  },
  render: (args) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label {...args} htmlFor="interactive-input">
          Click me to focus the input
        </Label>
        <Input
          id="interactive-input"
          placeholder="Focus me when label is clicked"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="interactive-checkbox" />
        <Label {...args} htmlFor="interactive-checkbox">
          Click to toggle checkbox
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="interactive-switch" />
        <Label {...args} htmlFor="interactive-switch">
          Click to toggle switch
        </Label>
      </div>

      <div className="space-y-2">
        <Label {...args}>Choose an option</Label>
        <RadioGroup className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="option1" value="option1" />
            <Label htmlFor="option1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="option2" value="option2" />
            <Label htmlFor="option2">Option 2</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};
