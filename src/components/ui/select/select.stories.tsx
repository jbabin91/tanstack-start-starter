import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'UI/Inputs/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A select component built on Radix UI for selecting values from a list of options. Fully accessible with keyboard navigation and WCAG AA compliant.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex min-h-[350px] items-center justify-center">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    defaultValue: {
      description: 'The default selected value',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      description: 'The controlled selected value',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      description: 'Whether the select is disabled',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      description: 'Whether the select is required',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onValueChange: {
      description: 'Callback when the value changes',
      action: 'changed',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic select example
export const Default: Story = {
  args: {
    defaultValue: 'apple',
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Select a fruit" className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  ),
};

// With placeholder
export const WithPlaceholder: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select an option" className="w-[200px]">
        <SelectValue placeholder="Select an option..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

// With groups and labels
export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a timezone" className="w-[280px]">
        <SelectValue placeholder="Select a timezone..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
          <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
          <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
          <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe & Africa</SelectLabel>
          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          <SelectItem value="cet">Central European Time (CET)</SelectItem>
          <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Asia</SelectLabel>
          <SelectItem value="msk">Moscow Time (MSK)</SelectItem>
          <SelectItem value="ist">India Standard Time (IST)</SelectItem>
          <SelectItem value="cst_china">China Standard Time (CST)</SelectItem>
          <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-20 text-sm">Small:</span>
        <Select defaultValue="small">
          <SelectTrigger
            aria-label="Small select"
            className="w-[180px]"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small Size</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-sm">Default:</span>
        <Select defaultValue="default">
          <SelectTrigger aria-label="Default select" className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Size</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Select disabled defaultValue="disabled">
        <SelectTrigger aria-label="Disabled select" className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="disabled">Disabled Select</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger
          aria-label="Select with disabled items"
          className="w-[200px]"
        >
          <SelectValue placeholder="With disabled items" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active Item</SelectItem>
          <SelectItem disabled value="disabled">
            Disabled Item
          </SelectItem>
          <SelectItem value="another">Another Item</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

// Component for controlled example
function ControlledSelect() {
  const [value, setValue] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Select a color" className="w-[200px]">
          <SelectValue placeholder="Select a color..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="red">Red</SelectItem>
          <SelectItem value="green">Green</SelectItem>
          <SelectItem value="blue">Blue</SelectItem>
          <SelectItem value="yellow">Yellow</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">
        Selected value: {value || 'none'}
      </p>
      <button
        className="bg-primary text-primary-foreground w-fit rounded-md px-3 py-1 text-sm"
        type="button"
        onClick={() => setValue('blue')}
      >
        Set to Blue
      </button>
    </div>
  );
}

// Controlled component
export const Controlled: Story = {
  render: () => <ControlledSelect />,
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a status" className="w-[250px]">
        <SelectValue placeholder="Select a status..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <Icons.clock className="text-warning" />
          <span>Pending</span>
        </SelectItem>
        <SelectItem value="processing">
          <Icons.loader className="text-info animate-spin" />
          <span>Processing</span>
        </SelectItem>
        <SelectItem value="success">
          <Icons.checkCircle className="text-success" />
          <span>Success</span>
        </SelectItem>
        <SelectItem value="failed">
          <Icons.xCircle className="text-error" />
          <span>Failed</span>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};

// Long list with scroll
export const LongList: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Select a country" className="w-[200px]">
        <SelectValue placeholder="Select a country..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="mx">Mexico</SelectItem>
        <SelectItem value="gb">United Kingdom</SelectItem>
        <SelectItem value="fr">France</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="it">Italy</SelectItem>
        <SelectItem value="es">Spain</SelectItem>
        <SelectItem value="pt">Portugal</SelectItem>
        <SelectItem value="nl">Netherlands</SelectItem>
        <SelectItem value="be">Belgium</SelectItem>
        <SelectItem value="ch">Switzerland</SelectItem>
        <SelectItem value="at">Austria</SelectItem>
        <SelectItem value="pl">Poland</SelectItem>
        <SelectItem value="ru">Russia</SelectItem>
        <SelectItem value="jp">Japan</SelectItem>
        <SelectItem value="cn">China</SelectItem>
        <SelectItem value="kr">South Korea</SelectItem>
        <SelectItem value="in">India</SelectItem>
        <SelectItem value="au">Australia</SelectItem>
        <SelectItem value="nz">New Zealand</SelectItem>
        <SelectItem value="br">Brazil</SelectItem>
        <SelectItem value="ar">Argentina</SelectItem>
        <SelectItem value="za">South Africa</SelectItem>
        <SelectItem value="eg">Egypt</SelectItem>
      </SelectContent>
    </Select>
  ),
};

// Form example
export const InForm: Story = {
  render: () => (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const country = formData.get('country');
        alert(`Submitted: ${typeof country === 'string' ? country : 'none'}`);
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="country">
          Country
        </label>
        <Select required name="country">
          <SelectTrigger className="w-[240px]" id="country">
            <SelectValue placeholder="Select your country..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <button
        className="bg-primary text-primary-foreground w-fit rounded-md px-4 py-2 text-sm"
        type="submit"
      >
        Submit
      </button>
    </form>
  ),
};

// Interactive test
export const Interactive: Story = {
  render: () => (
    <Select>
      <SelectTrigger aria-label="Interactive select" className="w-[200px]">
        <SelectValue placeholder="Click to open..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="first">First Option</SelectItem>
        <SelectItem value="second">Second Option</SelectItem>
        <SelectItem value="third">Third Option</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open select dropdown', async () => {
      // Use semantic query - getByRole with combobox role
      const trigger = canvas.getByRole('combobox', {
        name: 'Interactive select',
      });
      await userEvent.click(trigger);

      // Wait for dropdown to open and become visible
      await waitFor(
        () => {
          expect(trigger).toHaveAttribute('aria-expanded', 'true');
        },
        { timeout: 2000 },
      );

      // Give animation time to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Wait for content to be visible - options are rendered in a portal
      await waitFor(
        async () => {
          const firstOption = within(document.body).getByText('First Option');
          await expect(firstOption).toBeVisible();
        },
        { timeout: 2000 },
      );
    });

    await step('Select an option', async () => {
      const secondOption = within(document.body).getByText('Second Option');
      await userEvent.click(secondOption);

      // Check that the value is displayed using semantic query
      const trigger = canvas.getByRole('combobox', {
        name: 'Interactive select',
      });
      await expect(trigger).toHaveTextContent('Second Option');
    });

    await step('Open and close with keyboard', async () => {
      const trigger = canvas.getByRole('combobox', {
        name: 'Interactive select',
      });
      await userEvent.click(trigger);

      // Press Escape to close
      await userEvent.keyboard('{Escape}');

      // Verify dropdown is closed - check in document.body since it's portaled
      const firstOption = within(document.body).queryByText('First Option');
      expect(firstOption).not.toBeInTheDocument();
    });
  },
};

// Custom styling
export const CustomStyling: Story = {
  render: () => (
    <Select>
      <SelectTrigger
        aria-label="Custom styled select"
        className="border-primary bg-primary/5 text-primary hover:bg-primary/10 data-[placeholder]:text-primary/80 w-[250px] border-2"
      >
        <SelectValue placeholder="Custom styled select..." />
      </SelectTrigger>
      <SelectContent className="border-primary bg-primary/5">
        <SelectItem
          className="text-primary hover:bg-primary/20"
          value="option1"
        >
          Primary Option
        </SelectItem>
        <SelectItem className="text-info hover:bg-info/20" value="option2">
          Info Option
        </SelectItem>
        <SelectItem
          className="text-success hover:bg-success/20"
          value="option3"
        >
          Success Option
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};

// Error state example
export const ErrorState: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          className="text-error text-sm font-medium"
          htmlFor="error-select"
        >
          Required Field *
        </label>
        <Select>
          <SelectTrigger
            aria-describedby="select-error-message"
            aria-invalid="true"
            aria-label="Required field"
            className="border-error focus-visible:ring-error/50 w-[240px]"
            id="error-select"
          >
            <SelectValue placeholder="Please select an option..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-error text-sm" id="select-error-message">
          This field is required
        </p>
      </div>
    </div>
  ),
};
