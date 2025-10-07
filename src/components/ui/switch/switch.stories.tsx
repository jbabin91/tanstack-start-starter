import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import { Switch } from '@/components/ui/switch/switch';

const meta: Meta<typeof Switch> = {
  args: {
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: {
      control: { type: 'boolean' },
      description: 'The controlled checked state of the switch.',
      table: {
        type: { summary: 'boolean' },
      },
    },
    defaultChecked: {
      control: { type: 'boolean' },
      description: 'The default checked state when uncontrolled.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the switch is disabled.',
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
        type: { summary: '(checked: boolean) => void' },
      },
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the switch is required in a form.',
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
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A switch component for binary on/off choices. Built with Radix UI primitives and follows accessibility best practices.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Forms/Switch',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultSwitch: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default unchecked switch in its basic state.',
      },
    },
  },
};

export const CheckedSwitch: Story = {
  args: {
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Switch in checked (on) state.',
      },
    },
  },
};

export const DisabledSwitch: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled switch that cannot be interacted with.',
      },
    },
  },
};

export const DisabledCheckedSwitch: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled switch in checked state.',
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
          'Switch with associated label. The label is properly connected via htmlFor/id for accessibility.',
      },
    },
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch id="notifications-switch" {...args} />
      <label
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor="notifications-switch"
      >
        Enable notifications
      </label>
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Switch with label and description text for providing additional context.',
      },
    },
  },
  render: (args) => (
    <div className="flex items-start space-x-3">
      <Switch className="mt-1" id="marketing-switch" {...args} />
      <div className="grid gap-1.5 leading-none">
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="marketing-switch"
        >
          Marketing emails
        </label>
        <p className="text-muted-foreground text-xs">
          Receive emails about new products, features, and company news.
        </p>
      </div>
    </div>
  ),
};

export const SettingsGroup: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Multiple switches in a settings group showing different states and contexts.',
      },
    },
  },
  render: (args) => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Privacy Settings</h3>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Switch
            defaultChecked
            className="mt-1"
            id="analytics-switch"
            {...args}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="analytics-switch"
            >
              Analytics
            </label>
            <p className="text-muted-foreground text-xs">
              Help us improve by sharing anonymous usage data.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Switch className="mt-1" id="tracking-switch" {...args} />
          <div className="grid gap-1.5 leading-none">
            <label
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="tracking-switch"
            >
              Ad tracking
            </label>
            <p className="text-muted-foreground text-xs">
              Allow personalized ads based on your activity.
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Switch
            defaultChecked
            disabled
            className="mt-1"
            id="essential-switch"
            {...args}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="essential-switch"
            >
              Essential cookies
            </label>
            <p className="text-muted-foreground text-xs">
              Required for the website to function properly (cannot be
              disabled).
            </p>
          </div>
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
          'Switches integrated into a form with fieldset, legend, and proper name/value attributes for submission.',
      },
    },
  },
  render: (args) => (
    <form className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Account Preferences</legend>
        <div className="flex items-center space-x-2">
          <Switch
            defaultChecked
            id="form-notifications"
            name="notifications"
            value="enabled"
            {...args}
          />
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="form-notifications"
          >
            Email notifications
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="form-newsletter"
            name="newsletter"
            value="enabled"
            {...args}
          />
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="form-newsletter"
          >
            Newsletter subscription
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            defaultChecked
            required
            id="form-updates"
            name="updates"
            value="enabled"
            {...args}
          />
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="form-updates"
          >
            Security updates (required)
          </label>
        </div>
      </fieldset>
    </form>
  ),
};

export const SizeVariations: Story = {
  args: {
    defaultChecked: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Different size variations of the switch using CSS scale transforms.',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Switch className="scale-75" {...args} />
        <span className="text-sm">Small (75%)</span>
      </div>
      <div className="flex items-center space-x-4">
        <Switch {...args} />
        <span className="text-sm">Default (100%)</span>
      </div>
      <div className="flex items-center space-x-4">
        <Switch className="scale-125" {...args} />
        <span className="text-sm">Large (125%)</span>
      </div>
    </div>
  ),
};

export const InteractiveSwitch: Story = {
  args: {
    onCheckedChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive switch for testing user interactions and callback handling.',
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Find switch by role and verify initial state
    const switchElement = canvas.getByRole('switch', {
      name: 'Interactive switch',
    });
    expect(switchElement).not.toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'false');

    // Click to turn on the switch
    await userEvent.click(switchElement);
    expect(switchElement).toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
    expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Click to turn off the switch
    await userEvent.click(switchElement);
    expect(switchElement).not.toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
    expect(args.onCheckedChange).toHaveBeenCalledWith(false);

    // Verify accessibility - switch should be focusable
    switchElement.focus();
    expect(switchElement).toHaveFocus();

    // Test keyboard interaction (Space key)
    await userEvent.keyboard(' ');
    expect(switchElement).toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
    expect(args.onCheckedChange).toHaveBeenCalledWith(true);

    // Test keyboard interaction (Enter key)
    await userEvent.keyboard('{Enter}');
    expect(switchElement).not.toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
    expect(args.onCheckedChange).toHaveBeenCalledWith(false);
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch id="interactive-switch" {...args} />
      <label
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor="interactive-switch"
      >
        Interactive switch
      </label>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates accessibility features including ARIA attributes, keyboard navigation, and screen reader support.',
      },
    },
  },
  render: (args) => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Accessibility Features</h4>
      <div className="text-muted-foreground space-y-3 text-xs">
        <p>• Proper ARIA attributes (role=&quot;switch&quot;, aria-checked)</p>
        <p>• Keyboard navigation (Tab to focus, Space/Enter to toggle)</p>
        <p>• Screen reader support via associated labels</p>
        <p>• Focus indicators and disabled state handling</p>
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          aria-describedby="accessibility-description"
          id="accessibility-demo"
          {...args}
        />
        <label
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="accessibility-demo"
        >
          Accessible switch
        </label>
      </div>
      <p
        className="text-muted-foreground text-xs"
        id="accessibility-description"
      >
        This switch demonstrates proper accessibility implementation.
      </p>
    </div>
  ),
};
