import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import { Checkbox } from '@/components/ui/checkbox/checkbox';

const meta: Meta<typeof Checkbox> = {
  args: {
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: {
      control: { type: 'boolean' },
      description: 'The checked state of the checkbox.',
      table: {
        type: { summary: 'boolean | "indeterminate"' },
        defaultValue: { summary: 'undefined' },
      },
    },
    defaultChecked: {
      control: { type: 'boolean' },
      description: 'The default checked state when uncontrolled.',
      table: {
        type: { summary: 'boolean' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is disabled.',
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
    onCheckedChange: {
      action: 'onCheckedChange',
      description: 'Callback fired when the checked state changes.',
      table: {
        type: { summary: '(checked: boolean | "indeterminate") => void' },
      },
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is required in a form.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    value: {
      control: { type: 'text' },
      description: 'The value attribute for form submission.',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"on"' },
      },
    },
  },
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A checkbox component for binary choices. Built with Radix UI primitives and follows accessibility best practices.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Forms/Checkbox',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultCheckbox: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default unchecked checkbox in its basic state.',
      },
    },
  },
};

export const CheckedCheckbox: Story = {
  args: {
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox in checked state showing the check icon.',
      },
    },
  },
};

export const DisabledCheckbox: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkbox that cannot be interacted with.',
      },
    },
  },
};

export const DisabledCheckedCheckbox: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkbox in checked state.',
      },
    },
  },
};

export const IndeterminateCheckbox: Story = {
  args: {
    checked: 'indeterminate',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Checkbox in indeterminate state, useful for "select all" functionality when some items are selected.',
      },
    },
  },
};

export const WithLabel: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Checkbox with associated label and description text. The label is properly connected via htmlFor/id for accessibility.',
      },
    },
  },
  render: (args) => (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms" {...args} />
      <div className="grid gap-1.5 leading-none">
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="terms"
        >
          Accept terms and conditions
        </label>
        <p className="text-muted-foreground text-xs">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  ),
};

export const MultipleCheckboxes: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Multiple checkboxes in a form-like layout showing different states and proper labeling.',
      },
    },
  },
  render: (args) => (
    <div className="space-y-4">
      <div className="items-top flex space-x-2">
        <Checkbox id="notifications" {...args} />
        <div className="grid gap-1.5 leading-none">
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="notifications"
          >
            Email notifications
          </label>
          <p className="text-muted-foreground text-xs">
            Receive email updates about your account activity.
          </p>
        </div>
      </div>
      <div className="items-top flex space-x-2">
        <Checkbox defaultChecked id="marketing" {...args} />
        <div className="grid gap-1.5 leading-none">
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="marketing"
          >
            Marketing emails
          </label>
          <p className="text-muted-foreground text-xs">
            Receive emails about new products and features.
          </p>
        </div>
      </div>
      <div className="items-top flex space-x-2">
        <Checkbox disabled id="security" {...args} />
        <div className="grid gap-1.5 leading-none">
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="security"
          >
            Security alerts
          </label>
          <p className="text-muted-foreground text-xs">
            Critical security notifications (cannot be disabled).
          </p>
        </div>
      </div>
    </div>
  ),
};

export const FormIntegration: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Checkboxes integrated into a form with fieldset, legend, and proper name/value attributes for submission.',
      },
    },
  },
  render: (args) => (
    <form className="space-y-4">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Preferences</legend>
        <div className="items-top flex space-x-2">
          <Checkbox
            id="newsletter"
            name="preferences"
            value="newsletter"
            {...args}
          />
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="newsletter"
          >
            Subscribe to newsletter
          </label>
        </div>
        <div className="items-top flex space-x-2">
          <Checkbox
            defaultChecked
            id="updates"
            name="preferences"
            value="updates"
            {...args}
          />
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="updates"
          >
            Product updates
          </label>
        </div>
        <div className="items-top flex space-x-2">
          <Checkbox
            defaultChecked
            required
            id="required"
            name="preferences"
            value="required"
            {...args}
          />
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="required"
          >
            Required notifications *
          </label>
        </div>
      </fieldset>
    </form>
  ),
};

export const InteractiveCheckbox: Story = {
  args: {
    onCheckedChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive checkbox for testing user interactions and callback handling.',
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Find checkbox by role and verify initial state
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Interactive checkbox',
    });
    expect(checkbox).not.toBeChecked();

    // Click to check the checkbox
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Click to uncheck the checkbox
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledWith(false);

    // Verify accessibility - checkbox should be focusable
    checkbox.focus();
    expect(checkbox).toHaveFocus();

    // Test keyboard interaction (Space key)
    await userEvent.keyboard(' ');
    expect(checkbox).toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
  render: (args) => (
    <div className="items-top flex space-x-2">
      <Checkbox id="interactive-checkbox" {...args} />
      <label
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor="interactive-checkbox"
      >
        Interactive checkbox
      </label>
    </div>
  ),
};
