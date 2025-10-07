import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { type DateRange } from 'react-day-picker';

import { Calendar } from '@/components/ui/calendar/calendar';

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A date picker component built on top of react-day-picker with support for single dates, date ranges, and multiple date selection.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Inputs/Calendar',
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default calendar with current month displayed.',
      },
    },
  },
  render: () => <Calendar />,
};

export const WithSelectedDate: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar with a pre-selected date.',
      },
    },
  },
  render: function WithSelectedDateStory() {
    const [selected, setSelected] = useState<Date | undefined>(
      () => new Date(),
    );
    return (
      <Calendar mode="single" selected={selected} onSelect={setSelected} />
    );
  },
};

export const RangeSelection: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar configured for date range selection.',
      },
    },
  },
  render: function RangeSelectionStory() {
    const [range, setRange] = useState<DateRange | undefined>(() => ({
      from: new Date(2024, 0, 10),
      to: new Date(2024, 0, 15),
    }));

    return (
      <Calendar
        mode="range"
        numberOfMonths={1}
        selected={range}
        onSelect={setRange}
      />
    );
  },
};

export const MultipleSelection: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar allowing selection of multiple dates.',
      },
    },
  },
  render: function MultipleSelectionStory() {
    const [selected, setSelected] = useState<Date[]>(() => [
      new Date(2024, 0, 5),
      new Date(2024, 0, 10),
      new Date(2024, 0, 15),
    ]);

    return (
      <Calendar
        required
        mode="multiple"
        selected={selected}
        onSelect={setSelected}
      />
    );
  },
};

export const TwoMonths: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar displaying two months side by side.',
      },
    },
  },
  render: () => <Calendar showOutsideDays numberOfMonths={2} />,
};

export const WithWeekNumbers: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar with week numbers displayed, starting week on Monday.',
      },
    },
  },
  render: () => <Calendar showWeekNumber weekStartsOn={1} />,
};

export const DisabledDates: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar with disabled past dates and weekends.',
      },
    },
  },
  render: () => {
    const disabledDays = [
      { before: new Date() }, // All past dates
      { dayOfWeek: [0, 6] }, // Weekends
    ];

    return <Calendar disabled={disabledDays} mode="single" />;
  },
};

export const CustomFooter: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar with custom footer displaying selected date.',
      },
    },
  },
  render: function CustomFooterStory() {
    const [selected, setSelected] = useState<Date | undefined>();

    return (
      <Calendar
        footer={
          selected ? (
            <p className="text-muted-foreground mt-2 text-sm">
              Selected: {selected.toLocaleDateString()}
            </p>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">Pick a date</p>
          )
        }
        mode="single"
        selected={selected}
        onSelect={setSelected}
      />
    );
  },
};

export const WithDropdowns: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Calendar with dropdown selectors for month and year navigation.',
      },
    },
  },
  render: () => {
    const currentYear = new Date().getFullYear();
    return (
      <Calendar
        captionLayout="dropdown"
        defaultMonth={new Date(currentYear, 5)} // June
        fromYear={currentYear - 10}
        toYear={currentYear + 10}
      />
    );
  },
};

export const FixedWeeks: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Calendar with fixed 6 weeks displayed to prevent layout shifts.',
      },
    },
  },
  render: () => <Calendar fixedWeeks showOutsideDays />,
};

export const CustomStyling: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Calendar with custom styling applied to various elements.',
      },
    },
  },
  render: () => (
    <Calendar
      className="rounded-lg border"
      classNames={{
        day: 'hover:bg-blue-50',
        selected: 'bg-blue-500 text-white hover:bg-blue-600',
        today: 'bg-blue-100 text-blue-900 font-bold',
      }}
    />
  ),
};

export const Interactive: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Interactive calendar with date selection and navigation controls.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify calendar is rendered
    const calendar = canvasElement.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();

    // Find navigation buttons
    const nextButton = canvas.getByRole('button', {
      name: /go to the next month/i,
    });
    const prevButton = canvas.getByRole('button', {
      name: /go to the previous month/i,
    });

    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();

    // Test navigation
    await userEvent.click(nextButton);
    await userEvent.click(prevButton);

    // Find date buttons and verify they exist
    const dateButtons = canvas.getAllByRole('button').filter((button) => {
      const text = button.textContent;
      return text && /^\d+$/.test(text);
    });

    // Verify that we have date buttons rendered
    expect(dateButtons.length).toBeGreaterThan(0);

    // Verify grid structure is present
    const grid = canvas.getByRole('grid');
    expect(grid).toBeInTheDocument();
  },
  render: function InteractiveStory() {
    const [selected, setSelected] = useState<Date | undefined>();

    return (
      <div className="space-y-4">
        <Calendar mode="single" selected={selected} onSelect={setSelected} />
        {selected && (
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Selected: {selected.toDateString()}
            </p>
          </div>
        )}
      </div>
    );
  },
};
