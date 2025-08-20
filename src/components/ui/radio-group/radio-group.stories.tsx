import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import { RadioGroup, RadioGroupItem } from './radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Forms/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A radio group component for single selection from multiple options. Built with Radix UI primitives and follows accessibility best practices.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'The controlled value of the radio group.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    defaultValue: {
      description: 'The default value when uncontrolled.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      description: 'Whether the entire radio group is disabled.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      description: 'Whether the radio group is required in a form.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    name: {
      description: 'The name attribute for form submission.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    orientation: {
      description: 'The orientation of the radio group.',
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"vertical"' },
      },
    },
    onValueChange: {
      description: 'Callback fired when the value changes.',
      action: 'onValueChange',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
  },
  args: {
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultRadioGroup: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="option1" value="option1" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="option1"
        >
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="option2" value="option2" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="option2"
        >
          Option 2
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="option3" value="option3" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="option3"
        >
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default radio group with three options in vertical layout.',
      },
    },
  },
};

export const WithDefaultValue: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="default-option1" value="option1" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="default-option1"
        >
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="default-option2" value="option2" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="default-option2"
        >
          Option 2 (Default)
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="default-option3" value="option3" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="default-option3"
        >
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
  args: {
    defaultValue: 'option2',
  },
  parameters: {
    docs: {
      description: {
        story: 'Radio group with option 2 selected by default.',
      },
    },
  },
};

export const DisabledRadioGroup: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="disabled-option1" value="option1" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="disabled-option1"
        >
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="disabled-option2" value="option2" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="disabled-option2"
        >
          Option 2
        </label>
      </div>
    </RadioGroup>
  ),
  args: {
    disabled: true,
    defaultValue: 'option1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled radio group where no options can be selected.',
      },
    },
  },
};

export const IndividualDisabledItems: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="individual-option1" value="option1" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="individual-option1"
        >
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem disabled id="individual-option2" value="option2" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="individual-option2"
        >
          Option 2 (Disabled)
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="individual-option3" value="option3" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="individual-option3"
        >
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Radio group with one individually disabled option.',
      },
    },
  },
};

export const HorizontalRadioGroup: Story = {
  render: (args) => (
    <RadioGroup className="flex space-x-6" {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="size-small" value="small" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="size-small"
        >
          Small
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="size-medium" value="medium" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="size-medium"
        >
          Medium
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="size-large" value="large" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="size-large"
        >
          Large
        </label>
      </div>
    </RadioGroup>
  ),
  args: {
    orientation: 'horizontal',
    defaultValue: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Radio group arranged horizontally for size selection.',
      },
    },
  },
};

export const WithDescriptions: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-start space-x-2">
        <RadioGroupItem className="mt-1" id="plan-basic" value="basic" />
        <div className="grid gap-1.5 leading-none">
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="plan-basic"
          >
            Basic Plan
          </label>
          <p className="text-muted-foreground text-xs">
            Perfect for individuals. Includes 5GB storage and basic features.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem className="mt-1" id="plan-pro" value="pro" />
        <div className="grid gap-1.5 leading-none">
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="plan-pro"
          >
            Pro Plan
          </label>
          <p className="text-muted-foreground text-xs">
            Great for small teams. Includes 50GB storage and advanced features.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem
          className="mt-1"
          id="plan-enterprise"
          value="enterprise"
        />
        <div className="grid gap-1.5 leading-none">
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="plan-enterprise"
          >
            Enterprise Plan
          </label>
          <p className="text-muted-foreground text-xs">
            For large organizations. Unlimited storage and premium support.
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
  args: {
    defaultValue: 'pro',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Radio group with detailed descriptions for each option, useful for plan selection.',
      },
    },
  },
};

export const FormIntegration: Story = {
  render: (args) => (
    <form className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Notification Method</legend>
        <RadioGroup name="notifications" {...args}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="form-email" value="email" />
            <label
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="form-email"
            >
              Email
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="form-sms" value="sms" />
            <label
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="form-sms"
            >
              SMS
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="form-push" value="push" />
            <label
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="form-push"
            >
              Push Notification
            </label>
          </div>
        </RadioGroup>
      </fieldset>
    </form>
  ),
  args: {
    required: true,
    defaultValue: 'email',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Radio group integrated into a form with fieldset, legend, and proper name attribute for submission.',
      },
    },
  },
};

export const InteractiveRadioGroup: Story = {
  args: {
    onValueChange: fn(),
  },
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="interactive-red" value="red" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="interactive-red"
        >
          Red
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="interactive-green" value="green" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="interactive-green"
        >
          Green
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="interactive-blue" value="blue" />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="interactive-blue"
        >
          Blue
        </label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Interactive radio group for testing user interactions and callback handling.',
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Find radio group by role
    const radioGroup = canvas.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();

    // Find all radio buttons
    const redRadio = canvas.getByRole('radio', { name: 'Red' });
    const greenRadio = canvas.getByRole('radio', { name: 'Green' });
    const blueRadio = canvas.getByRole('radio', { name: 'Blue' });

    // Verify initial state - no option selected
    expect(redRadio).not.toBeChecked();
    expect(greenRadio).not.toBeChecked();
    expect(blueRadio).not.toBeChecked();

    // Click red option
    await userEvent.click(redRadio);
    expect(redRadio).toBeChecked();
    expect(greenRadio).not.toBeChecked();
    expect(blueRadio).not.toBeChecked();
    expect(args.onValueChange).toHaveBeenCalledWith('red');

    // Click green option (should deselect red)
    await userEvent.click(greenRadio);
    expect(redRadio).not.toBeChecked();
    expect(greenRadio).toBeChecked();
    expect(blueRadio).not.toBeChecked();
    expect(args.onValueChange).toHaveBeenCalledWith('green');

    // Test keyboard navigation
    await userEvent.tab();
    expect(document.activeElement).toBe(greenRadio);

    // Use arrow keys to navigate
    await userEvent.keyboard('{ArrowDown}');
    expect(blueRadio).toBeChecked();
    expect(args.onValueChange).toHaveBeenCalledWith('blue');

    await userEvent.keyboard('{ArrowUp}');
    expect(greenRadio).toBeChecked();
    expect(args.onValueChange).toHaveBeenCalledWith('green');
  },
};
