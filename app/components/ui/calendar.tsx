import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

import { cn } from '~/lib/utils';

import { buttonVariants } from './button';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn('p-3', className)}
      classNames={{
        caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: 'text-sm font-medium',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 p-0 font-normal aria-selected:opacity-100',
        ),
        day_disabled: 'text-muted-foreground opacity-50',
        day_hidden: 'invisible',
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_range_end: 'day-range-end',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_range_start: 'day-range-start',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        head_row: 'flex',
        month: 'flex flex-col gap-4',
        months: 'flex flex-col sm:flex-row gap-2',
        nav: 'flex items-center gap-1',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        nav_button_next: 'absolute right-1',
        nav_button_previous: 'absolute left-1',
        row: 'flex w-full mt-2',
        table: 'w-full border-collapse space-x-1',
        ...classNames,
      }}
      components={{
        // eslint-disable-next-line @eslint-react/no-nested-components
        IconLeft: ({ className, ...props }) => (
          <LuChevronLeft className={cn('size-4', className)} {...props} />
        ),
        // eslint-disable-next-line @eslint-react/no-nested-components
        IconRight: ({ className, ...props }) => (
          <LuChevronRight className={cn('size-4', className)} {...props} />
        ),
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}

export { Calendar };
