import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';
import { type DateRange } from 'react-day-picker';

import { Calendar } from './calendar';

const meta: Meta<typeof Calendar> = {
  title: 'UI/Inputs/Calendar',
  component: Calendar,
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
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  render: () => <Calendar />,
  parameters: {
    docs: {
      description: {
        story: 'Default calendar with current month displayed.',
      },
    },
  },
};

export const WithSelectedDate: Story = {
  render: function WithSelectedDateStory() {
    const [selected, setSelected] = useState<Date | undefined>(
      () => new Date(),
    );
    return (
      <Calendar mode="single" selected={selected} onSelect={setSelected} />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with a pre-selected date.',
      },
    },
  },
};

export const RangeSelection: Story = {
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
  parameters: {
    docs: {
      description: {
        story: 'Calendar configured for date range selection.',
      },
    },
  },
};

export const MultipleSelection: Story = {
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
  parameters: {
    docs: {
      description: {
        story: 'Calendar allowing selection of multiple dates.',
      },
    },
  },
};

export const TwoMonths: Story = {
  render: () => <Calendar showOutsideDays numberOfMonths={2} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar displaying two months side by side.',
      },
    },
  },
};

export const WithWeekNumbers: Story = {
  render: () => <Calendar showWeekNumber weekStartsOn={1} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with week numbers displayed, starting week on Monday.',
      },
    },
  },
};

export const DisabledDates: Story = {
  render: () => {
    const disabledDays = [
      { before: new Date() }, // All past dates
      { dayOfWeek: [0, 6] }, // Weekends
    ];

    return <Calendar disabled={disabledDays} mode="single" />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with disabled past dates and weekends.',
      },
    },
  },
};

export const CustomFooter: Story = {
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
  parameters: {
    docs: {
      description: {
        story: 'Calendar with custom footer displaying selected date.',
      },
    },
  },
};

export const WithDropdowns: Story = {
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
  parameters: {
    docs: {
      description: {
        story:
          'Calendar with dropdown selectors for month and year navigation.',
      },
    },
  },
};

export const FixedWeeks: Story = {
  render: () => <Calendar fixedWeeks showOutsideDays />,
  parameters: {
    docs: {
      description: {
        story:
          'Calendar with fixed 6 weeks displayed to prevent layout shifts.',
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <Calendar
      className="rounded-lg border"
      classNames={{
        today: 'bg-blue-100 text-blue-900 font-bold',
        day: 'hover:bg-blue-50',
        selected: 'bg-blue-500 text-white hover:bg-blue-600',
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with custom styling applied to various elements.',
      },
    },
  },
};

export const Interactive: Story = {
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
  parameters: {
    docs: {
      description: {
        story:
          'Interactive calendar with date selection and navigation controls.',
      },
    },
  },
};
