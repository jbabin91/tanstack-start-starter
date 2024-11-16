import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { format } from 'date-fns';
import type * as React from 'react';
import { type PropsBase, type PropsSingle } from 'react-day-picker';
import { LuCalendar } from 'react-icons/lu';
import { type Except, type Simplify } from 'type-fest';

import { Button } from '@/components/ui/button.tsx';
import { Calendar, type CalendarBaseProps } from '@/components/ui/calendar.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { cn } from '@/lib/utils.ts';

type CalendarProps = Simplify<
  Except<PropsBase & PropsSingle, 'mode'> &
    CalendarBaseProps & {
      selected?: Date;
      onSelect?: (date: Date) => void;
      defaultSelected?: Date;
    }
>;

type DatePickerProps = React.ComponentPropsWithRef<typeof Button> & {
  calendar?: CalendarProps;
};

function DatePicker({ calendar, className, ...props }: DatePickerProps) {
  const [date, setDate] = useControllableState({
    defaultProp: calendar?.defaultSelected,
    onChange: calendar?.onSelect,
    prop: calendar?.selected,
  });

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
          <span>{date ? format(date, 'PPP') : 'Pick a date'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} {...calendar} />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
