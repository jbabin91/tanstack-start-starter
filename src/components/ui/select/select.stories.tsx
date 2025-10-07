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
} from '@/components/ui/select/select';

const meta = {
  argTypes: {
    defaultValue: {
      control: 'text',
      description: 'The default selected value',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onValueChange: {
      action: 'changed',
      description: 'Callback when the value changes',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    value: {
      control: 'text',
      description: 'The controlled selected value',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  component: Select,
  decorators: [
    (Story) => (
      <div className="flex min-h-[350px] items-center justify-center">
        <Story />
      </div>
    ),
  ],
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
  title: 'UI/Inputs/Select',
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic select example
export const Default: Story = {
  args: {
    defaultValue: 'apple',
    items: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'blueberry', label: 'Blueberry' },
      { value: 'grapes', label: 'Grapes' },
      { value: 'pineapple', label: 'Pineapple' },
    ],
  },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Select a fruit" className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        {(args.items as { value: string; label: string }[] | undefined)?.map(
          (item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  ),
};

// With placeholder
export const WithPlaceholder: Story = {
  args: {},
  render: () => {
    const items = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    return (
      <Select items={items}>
        <SelectTrigger aria-label="Select an option" className="w-[200px]">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};

// With groups and labels
export const WithGroups: Story = {
  args: {},
  render: () => {
    const timezoneGroups = [
      {
        label: 'North America',
        items: [
          { value: 'est', label: 'Eastern Standard Time (EST)' },
          { value: 'cst', label: 'Central Standard Time (CST)' },
          { value: 'mst', label: 'Mountain Standard Time (MST)' },
          { value: 'pst', label: 'Pacific Standard Time (PST)' },
        ],
      },
      {
        label: 'Europe & Africa',
        items: [
          { value: 'gmt', label: 'Greenwich Mean Time (GMT)' },
          { value: 'cet', label: 'Central European Time (CET)' },
          { value: 'eet', label: 'Eastern European Time (EET)' },
        ],
      },
      {
        label: 'Asia',
        items: [
          { value: 'msk', label: 'Moscow Time (MSK)' },
          { value: 'ist', label: 'India Standard Time (IST)' },
          { value: 'cst_china', label: 'China Standard Time (CST)' },
          { value: 'jst', label: 'Japan Standard Time (JST)' },
        ],
      },
    ];

    const allItems = timezoneGroups.flatMap((group) => group.items);

    return (
      <Select items={allItems}>
        <SelectTrigger aria-label="Select a timezone" className="w-[280px]">
          <SelectValue placeholder="Select a timezone..." />
        </SelectTrigger>
        <SelectContent>
          {timezoneGroups.map((group, groupIndex) => (
            <div key={group.label}>
              <SelectGroup>
                <SelectLabel>{group.label}</SelectLabel>
                {group.items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              {groupIndex < timezoneGroups.length - 1 && <SelectSeparator />}
            </div>
          ))}
        </SelectContent>
      </Select>
    );
  },
};

// Different sizes
export const Sizes: Story = {
  args: {},
  render: () => {
    const smallItems = [
      { value: 'small', label: 'Small Size' },
      { value: 'option2', label: 'Option 2' },
    ];
    const defaultItems = [
      { value: 'default', label: 'Default Size' },
      { value: 'option2', label: 'Option 2' },
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Small:</span>
          <Select defaultValue="small" items={smallItems}>
            <SelectTrigger
              aria-label="Small select"
              className="w-[180px]"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {smallItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Default:</span>
          <Select defaultValue="default" items={defaultItems}>
            <SelectTrigger aria-label="Default select" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {defaultItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  },
};

// Disabled state
export const Disabled: Story = {
  args: {},
  render: () => {
    const disabledItems = [{ value: 'disabled', label: 'Disabled Select' }];
    const mixedItems = [
      { disabled: false, label: 'Active Item', value: 'active' },
      { disabled: true, label: 'Disabled Item', value: 'disabled' },
      { disabled: false, label: 'Another Item', value: 'another' },
    ];

    return (
      <div className="flex flex-col gap-4">
        <Select disabled defaultValue="disabled" items={disabledItems}>
          <SelectTrigger aria-label="Disabled select" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {disabledItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select items={mixedItems}>
          <SelectTrigger
            aria-label="Select with disabled items"
            className="w-[200px]"
          >
            <SelectValue placeholder="With disabled items" />
          </SelectTrigger>
          <SelectContent>
            {mixedItems.map((item) => (
              <SelectItem
                key={item.value}
                disabled={item.disabled}
                value={item.value}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
};

// Component for controlled example
function ControlledSelect() {
  const [value, setValue] = useState('');

  const colorItems = [
    { value: 'red', label: 'Red' },
    { value: 'green', label: 'Green' },
    { value: 'blue', label: 'Blue' },
    { value: 'yellow', label: 'Yellow' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Select items={colorItems} value={value} onValueChange={setValue}>
        <SelectTrigger aria-label="Select a color" className="w-[200px]">
          <SelectValue placeholder="Select a color..." />
        </SelectTrigger>
        <SelectContent>
          {colorItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
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
  args: {},
  render: () => <ControlledSelect />,
};

// With icons
export const WithIcons: Story = {
  args: {},
  render: () => {
    const statusItems = [
      {
        className: 'text-warning',
        icon: 'clock' as const,
        label: 'Pending',
        value: 'pending',
      },
      {
        className: 'text-info animate-spin',
        icon: 'loader' as const,
        label: 'Processing',
        value: 'processing',
      },
      {
        className: 'text-success',
        icon: 'checkCircle' as const,
        label: 'Success',
        value: 'success',
      },
      {
        className: 'text-error',
        icon: 'xCircle' as const,
        label: 'Failed',
        value: 'failed',
      },
    ];

    return (
      <Select items={statusItems}>
        <SelectTrigger aria-label="Select a status" className="w-[250px]">
          <SelectValue placeholder="Select a status..." />
        </SelectTrigger>
        <SelectContent>
          {statusItems.map((item) => {
            const IconComponent = Icons[item.icon];
            return (
              <SelectItem key={item.value} value={item.value}>
                <IconComponent className={item.className} />
                <span>{item.label}</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  },
};

// Long list with scroll
export const LongList: Story = {
  args: {},
  render: () => {
    const countries = [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'mx', label: 'Mexico' },
      { value: 'gb', label: 'United Kingdom' },
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
      { value: 'it', label: 'Italy' },
      { value: 'es', label: 'Spain' },
      { value: 'pt', label: 'Portugal' },
      { value: 'nl', label: 'Netherlands' },
      { value: 'be', label: 'Belgium' },
      { value: 'ch', label: 'Switzerland' },
      { value: 'at', label: 'Austria' },
      { value: 'pl', label: 'Poland' },
      { value: 'ru', label: 'Russia' },
      { value: 'jp', label: 'Japan' },
      { value: 'cn', label: 'China' },
      { value: 'kr', label: 'South Korea' },
      { value: 'in', label: 'India' },
      { value: 'au', label: 'Australia' },
      { value: 'nz', label: 'New Zealand' },
      { value: 'br', label: 'Brazil' },
      { value: 'ar', label: 'Argentina' },
      { value: 'za', label: 'South Africa' },
      { value: 'eg', label: 'Egypt' },
    ];

    return (
      <Select items={countries}>
        <SelectTrigger aria-label="Select a country" className="w-[200px]">
          <SelectValue placeholder="Select a country..." />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.value} value={country.value}>
              {country.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};

// Form example
export const InForm: Story = {
  args: {},
  render: () => {
    const formCountries = [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'au', label: 'Australia' },
    ];

    return (
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
          <Select required items={formCountries} name="country">
            <SelectTrigger className="w-[240px]" id="country">
              <SelectValue placeholder="Select your country..." />
            </SelectTrigger>
            <SelectContent>
              {formCountries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
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
    );
  },
};

// Interactive test
export const Interactive: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test basic select functionality
    const trigger = canvas.getByRole('combobox', {
      name: 'Interactive select',
    });

    // Open select
    await userEvent.click(trigger);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    // Select an option from portal
    const secondOption = within(document.body).getByText('Second Option');
    await userEvent.click(secondOption);

    // Verify selection
    await waitFor(() => {
      expect(trigger).toHaveTextContent('Second Option');
    });
  },
  render: () => {
    const interactiveItems = [
      { value: 'first', label: 'First Option' },
      { value: 'second', label: 'Second Option' },
      { value: 'third', label: 'Third Option' },
    ];

    return (
      <Select items={interactiveItems}>
        <SelectTrigger aria-label="Interactive select" className="w-[200px]">
          <SelectValue placeholder="Click to open..." />
        </SelectTrigger>
        <SelectContent>
          {interactiveItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};

// Custom styling
export const CustomStyling: Story = {
  args: {},
  render: () => {
    const styledItems = [
      { value: 'option1', label: 'Primary Option' },
      { value: 'option2', label: 'Info Option' },
      { value: 'option3', label: 'Success Option' },
    ];

    return (
      <Select items={styledItems}>
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
    );
  },
};

// Error state example
export const ErrorState: Story = {
  args: {},
  render: () => {
    const errorItems = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            className="text-error text-sm font-medium"
            htmlFor="error-select"
          >
            Required Field *
          </label>
          <Select items={errorItems}>
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
              {errorItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-error text-sm" id="select-error-message">
            This field is required
          </p>
        </div>
      </div>
    );
  },
};
