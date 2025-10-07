import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group/radio-group';

const meta: Meta<typeof RadioGroup> = {
  args: {
    onValueChange: fn(),
  },
  argTypes: {
    defaultValue: {
      control: { type: 'text' },
      description: 'The default value when uncontrolled.',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the entire radio group is disabled.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    name: {
      control: { type: 'text' },
      description: 'The name attribute for form submission.',
      table: {
        type: { summary: 'string' },
      },
    },
    onValueChange: {
      action: 'onValueChange',
      description: 'Callback fired when the value changes.',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    orientation: {
      control: { type: 'select' },
      description: 'The orientation of the radio group.',
      options: ['horizontal', 'vertical'],
      table: {
        type: { summary: '"horizontal" | "vertical"' },
        defaultValue: { summary: '"vertical"' },
      },
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the radio group is required in a form.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    value: {
      control: { type: 'text' },
      description: 'The controlled value of the radio group.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
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
  title: 'UI/Forms/RadioGroup',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultRadioGroup: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default radio group with three options in vertical layout.',
      },
    },
  },
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
};

export const WithDefaultValue: Story = {
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
};

export const DisabledRadioGroup: Story = {
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
};

export const IndividualDisabledItems: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Radio group with one individually disabled option.',
      },
    },
  },
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
};

export const HorizontalRadioGroup: Story = {
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
};

export const WithDescriptions: Story = {
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
};

export const FormIntegration: Story = {
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
};

export const InteractiveRadioGroup: Story = {
  args: {
    onValueChange: fn(),
  },
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

    // Test keyboard navigation - focus on the currently selected radio
    greenRadio.focus();
    expect(greenRadio).toHaveFocus();

    // Test direct clicking on blue option (simulating arrow key result)
    await userEvent.click(blueRadio);
    expect(blueRadio).toBeChecked();
    expect(redRadio).not.toBeChecked();
    expect(greenRadio).not.toBeChecked();
    expect(args.onValueChange).toHaveBeenCalledWith('blue');
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
};
