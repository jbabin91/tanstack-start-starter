import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';

import { Textarea } from '@/components/ui/textarea/textarea';

const meta: Meta<typeof Textarea> = {
  args: {
    onChange: fn(),
  },
  argTypes: {
    cols: {
      control: { type: 'number' },
      description:
        'Visible width of the text control, in average character widths.',
      table: {
        type: { summary: 'number' },
      },
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'The default value when uncontrolled.',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is disabled.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    maxLength: {
      control: { type: 'number' },
      description: 'Maximum number of characters allowed.',
      table: {
        type: { summary: 'number' },
      },
    },
    minLength: {
      control: { type: 'number' },
      description: 'Minimum number of characters required.',
      table: {
        type: { summary: 'number' },
      },
    },
    name: {
      control: { type: 'text' },
      description: 'The name attribute for form submission.',
      table: {
        type: { summary: 'string' },
      },
    },
    onChange: {
      action: 'onChange',
      description: 'Callback fired when the value changes.',
      table: {
        type: {
          summary: '(event: React.ChangeEvent<HTMLTextAreaElement>) => void',
        },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text displayed when the textarea is empty.',
      table: {
        type: { summary: 'string' },
      },
    },
    readOnly: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is read-only.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is required in a form.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    rows: {
      control: { type: 'number' },
      description: 'Number of visible text lines for the control.',
      table: {
        type: { summary: 'number' },
      },
    },
    value: {
      control: { type: 'text' },
      description: 'The controlled value of the textarea.',
      table: {
        type: { summary: 'string' },
      },
    },
  },
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
  title: 'UI/Forms/Textarea',
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
    defaultValue: 'This textarea is disabled and cannot be edited.',
    disabled: true,
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
    defaultValue:
      'This textarea has a maximum character limit of 100 characters.',
    maxLength: 100,
    placeholder: 'Maximum 100 characters allowed...',
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
    'aria-describedby': 'error-message',
    'aria-invalid': true,
    defaultValue: 'This content has an error',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Textarea in error state with appropriate ARIA attributes and error message.',
      },
    },
  },
  render: (args) => (
    <div className="space-y-2">
      <Textarea {...args} />
      <p className="text-xs text-red-600" id="error-message">
        This field contains invalid content.
      </p>
    </div>
  ),
};

export const WithLabel: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Textarea with associated label for proper accessibility.',
      },
    },
  },
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
};

export const WithLabelAndDescription: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Textarea with label and description text for additional context.',
      },
    },
  },
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
};

export const FormExample: Story = {
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
};

export const ResizableBehavior: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Different resize behaviors using CSS classes: resize, resize-y, and resize-none.',
      },
    },
  },
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
};

export const InteractiveTextarea: Story = {
  args: {
    onChange: fn(),
    placeholder: 'Type here to test interactions...',
  },
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
  render: (args) => (
    <div className="grid w-full gap-1.5">
      <label className="text-sm font-medium" htmlFor="interactive-textarea">
        Interactive textarea
      </label>
      <Textarea id="interactive-textarea" {...args} />
    </div>
  ),
};
