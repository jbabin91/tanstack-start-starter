import { Select as SelectPrimitive } from '@base-ui-components/react/select';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { cn } from '@/utils/cn';

function Select<T = unknown>({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root<T>>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  placeholder,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value> & {
  placeholder?: string;
}) {
  if (!placeholder) {
    return <SelectPrimitive.Value data-slot="select-value" {...props} />;
  }

  return (
    <SelectPrimitive.Value
      render={(_, { value }) => {
        if (value) {
          return <SelectPrimitive.Value data-slot="select-value" {...props} />;
        }

        // Placeholder
        return (
          <span className="text-muted-foreground" data-slot="select-value">
            {placeholder}
          </span>
        );
      }}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
}) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-error/20 dark:aria-invalid:ring-error/40 aria-invalid:border-error dark:bg-input/30 dark:hover:bg-input/50 data-[disabled]:bg-muted data-[disabled]:text-muted-foreground flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 data-[disabled]:shadow-none data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-size={size}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={<Icons.chevronDown className="opacity-50" />}
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  alignItemWithTrigger = false,
  sideOffset = 5,
  collisionAvoidance,
  align,
  alignOffset,
  side,
  arrowPadding,
  anchor,
  collisionBoundary,
  collisionPadding,
  sticky,
  positionMethod,
  trackAnchor,
  ...popupProps
}: React.ComponentProps<typeof SelectPrimitive.Popup> &
  React.ComponentProps<typeof SelectPrimitive.Positioner>) {
  const positionerProps = {
    align,
    alignItemWithTrigger,
    alignOffset,
    anchor,
    arrowPadding,
    collisionAvoidance,
    collisionBoundary,
    collisionPadding,
    positionMethod,
    side,
    sideOffset,
    sticky,
    trackAnchor,
  };

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        {...positionerProps}
        data-slot="select-positioner"
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Popup
          className={cn(
            'bg-popover text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md',
            className,
          )}
          data-slot="select-content"
          {...popupProps}
        >
          {children}
        </SelectPrimitive.Popup>
        <SelectScrollDownButton />
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
    <SelectPrimitive.GroupLabel
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      data-slot="select-label"
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      data-slot="select-item"
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icons.check />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      data-slot="select-separator"
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      className={cn(
        'bg-popover text-md z-51 flex h-6 w-full cursor-default items-center justify-center border text-center data-[direction=down]:rounded-b-md data-[direction=down]:border-t-0 data-[direction=up]:rounded-t-md data-[direction=up]:border-b-0',
        "before:absolute before:left-0 before:size-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:-bottom-full data-[direction=up]:before:top-full",
        className,
      )}
      data-slot="select-scroll-up-button"
      {...props}
    >
      <Icons.chevronUp className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      className={cn(
        'bg-popover text-md z-51 flex h-6 w-full cursor-default items-center justify-center border text-center data-[direction=down]:rounded-b-md data-[direction=down]:border-t-0 data-[direction=up]:rounded-t-md data-[direction=up]:border-b-0',
        "before:absolute before:left-0 before:size-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:-bottom-full data-[direction=up]:before:top-full",
        className,
      )}
      data-slot="select-scroll-down-button"
      {...props}
    >
      <Icons.chevronDown />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
