import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Forms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A textarea component for multi-line text input. Built with native HTML textarea element and enhanced with consistent styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      description: 'Placeholder text displayed when the textarea is empty.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      description: 'The controlled value of the textarea.',
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
      description: 'Whether the textarea is disabled.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    readOnly: {
      description: 'Whether the textarea is read-only.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      description: 'Whether the textarea is required in a form.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    rows: {
      description: 'Number of visible text lines for the control.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
      },
    },
    cols: {
      description:
        'Visible width of the text control, in average character widths.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
      },
    },
    maxLength: {
      description: 'Maximum number of characters allowed.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
      },
    },
    minLength: {
      description: 'Minimum number of characters required.',
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
      },
    },
    name: {
      description: 'The name attribute for form submission.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    onChange: {
      description: 'Callback fired when the value changes.',
      action: 'onChange',
      table: {
        type: {
          summary: '(event: React.ChangeEvent<HTMLTextAreaElement>) => void',
        },
      },
    },
  },
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultTextarea: Story = {
  args: {
    placeholder: 'Enter your text here...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default textarea with placeholder text.',
      },
    },
  },
};

export const WithValue: Story = {
  args: {
    defaultValue:
      'This is some example text in the textarea. It shows how the component looks with content.',
    placeholder: 'Enter your text here...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea with default value content.',
      },
    },
  },
};

export const DisabledTextarea: Story = {
  args: {
    disabled: true,
    defaultValue: 'This textarea is disabled and cannot be edited.',
    placeholder: 'Enter your text here...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled textarea that cannot be interacted with.',
      },
    },
  },
};

export const ReadOnlyTextarea: Story = {
  args: {
    readOnly: true,
    defaultValue:
      'This textarea is read-only. You can select text but cannot edit it.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only textarea that allows text selection but not editing.',
      },
    },
  },
};

export const WithRows: Story = {
  args: {
    rows: 8,
    placeholder:
      'This textarea has 8 rows and will display more text at once...',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Textarea with a specific number of rows for controlling height.',
      },
    },
  },
};

export const WithMaxLength: Story = {
  args: {
    maxLength: 100,
    placeholder: 'Maximum 100 characters allowed...',
    defaultValue:
      'This textarea has a maximum character limit of 100 characters.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea with character limit enforced by maxLength attribute.',
      },
    },
  },
};

export const Required: Story = {
  args: {
    required: true,
    placeholder: 'This field is required...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Required textarea for form validation.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    'aria-invalid': true,
    'aria-describedby': 'error-message',
    defaultValue: 'This content has an error',
  },
  render: (args) => (
    <div className="space-y-2">
      <Textarea {...args} />
      <p className="text-xs text-red-600" id="error-message">
        This field contains invalid content.
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Textarea in error state with appropriate ARIA attributes and error message.',
      },
    },
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <label className="text-sm font-medium" htmlFor="message-textarea">
        Your message
      </label>
      <Textarea
        id="message-textarea"
        placeholder="Type your message here..."
        {...args}
      />
    </div>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Textarea with associated label for proper accessibility.',
      },
    },
  },
};

export const WithLabelAndDescription: Story = {
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <label className="text-sm font-medium" htmlFor="feedback-textarea">
        Feedback
      </label>
      <Textarea
        id="feedback-textarea"
        placeholder="Tell us what you think..."
        {...args}
      />
      <p className="text-muted-foreground text-xs">
        Your feedback helps us improve our services.
      </p>
    </div>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Textarea with label and description text for additional context.',
      },
    },
  },
};

export const FormExample: Story = {
  render: (args) => (
    <form className="space-y-6">
      <div className="grid w-full gap-1.5">
        <label className="text-sm font-medium" htmlFor="form-comment">
          Comment *
        </label>
        <Textarea
          required
          id="form-comment"
          name="comment"
          placeholder="Share your thoughts..."
          {...args}
        />
        <p className="text-muted-foreground text-xs">
          Minimum 10 characters required.
        </p>
      </div>
      <div className="grid w-full gap-1.5">
        <label className="text-sm font-medium" htmlFor="form-details">
          Additional Details
        </label>
        <Textarea
          id="form-details"
          name="details"
          placeholder="Optional additional information..."
          rows={6}
          {...args}
        />
      </div>
    </form>
  ),
  args: {
    minLength: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Textarea components integrated into a form with proper labels and validation.',
      },
    },
  },
};

export const ResizableBehavior: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="grid w-full gap-1.5">
        <label className="text-sm font-medium" htmlFor="resize-both">
          Resizable (both directions)
        </label>
        <Textarea
          className="resize"
          id="resize-both"
          placeholder="You can resize this textarea in both directions..."
          {...args}
        />
      </div>
      <div className="grid w-full gap-1.5">
        <label className="text-sm font-medium" htmlFor="resize-vertical">
          Resizable (vertical only)
        </label>
        <Textarea
          className="resize-y"
          id="resize-vertical"
          placeholder="You can resize this textarea vertically..."
          {...args}
        />
      </div>
      <div className="grid w-full gap-1.5">
        <label className="text-sm font-medium" htmlFor="resize-none">
          No resize
        </label>
        <Textarea
          className="resize-none"
          id="resize-none"
          placeholder="This textarea cannot be resized..."
          {...args}
        />
      </div>
    </div>
  ),
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Different resize behaviors using CSS classes: resize, resize-y, and resize-none.',
      },
    },
  },
};

export const InteractiveTextarea: Story = {
  args: {
    onChange: fn(),
    placeholder: 'Type here to test interactions...',
  },
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <label className="text-sm font-medium" htmlFor="interactive-textarea">
        Interactive textarea
      </label>
      <Textarea id="interactive-textarea" {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Interactive textarea for testing user interactions and event handling.',
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // Find textarea by role
    const textarea = canvas.getByRole('textbox', {
      name: 'Interactive textarea',
    });
    expect(textarea).toBeInTheDocument();

    // Verify initial state
    expect(textarea).toHaveValue('');
    expect(textarea).toHaveAttribute(
      'placeholder',
      'Type here to test interactions...',
    );

    // Type some text
    await userEvent.type(textarea, 'Hello, this is a test message!');
    expect(textarea).toHaveValue('Hello, this is a test message!');
    expect(args.onChange).toHaveBeenCalled();

    // Test selection
    await userEvent.tripleClick(textarea);
    // Type assertion with proper validation
    if (!(textarea instanceof HTMLTextAreaElement)) {
      throw new TypeError('Expected textarea to be HTMLTextAreaElement');
    }
    expect(textarea.selectionStart).toBe(0);
    expect(textarea.selectionEnd).toBe(textarea.value.length);

    // Test clearing and retyping
    await userEvent.clear(textarea);
    expect(textarea).toHaveValue('');

    await userEvent.type(textarea, 'New content');
    expect(textarea).toHaveValue('New content');

    // Test keyboard navigation
    await userEvent.keyboard('{Home}');
    expect(textarea.selectionStart).toBe(0);

    await userEvent.keyboard('{End}');
    expect(textarea.selectionStart).toBe(textarea.value.length);

    // Test multiline input
    await userEvent.keyboard('{Enter}Second line');
    expect(textarea.value).toContain('\n');
    expect(textarea.value).toContain('Second line');
  },
};
