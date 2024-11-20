import { format } from 'date-fns';
import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { LuCalendar } from 'react-icons/lu';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function DateRangePicker({ className, ...props }: React.ComponentPropsWithRef<typeof Button>) {
  const [date, setDate] = React.useState<DateRange | undefined>();

  function formatDate() {
    if (!date?.from) return 'Pick a date';

    const from = format(date.from, 'LLL dd, y');
    if (!date.to) return from;

    const to = format(date.to, 'LLL dd, y');
    return `${from} - ${to}`;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'w-full justify-start gap-2 text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
          variant="outline"
          {...props}
        >
          <LuCalendar className="size-4" />
          <span>{formatDate()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          defaultMonth={date?.from}
          mode="range"
          numberOfMonths={2}
          selected={date}
          onSelect={setDate}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateRangePicker };
