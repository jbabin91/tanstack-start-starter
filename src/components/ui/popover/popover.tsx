'use client';

import { Popover as PopoverPrimitive } from '@base-ui-components/react/popover';
import * as React from 'react';

import { cn } from '@/utils/cn';

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      className={cn('relative', className)}
      data-slot="popover-trigger"
      {...props}
    />
  );
}

function PopoverContent({
  className,
  children,
  sideOffset = 4,
  showArrow = false,
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
}: React.ComponentProps<typeof PopoverPrimitive.Popup> &
  React.ComponentProps<typeof PopoverPrimitive.Positioner> & {
    showArrow?: boolean;
  }) {
  const adjustedSideOffset = showArrow
    ? typeof sideOffset === 'number'
      ? Math.max(sideOffset, 6)
      : 6
    : sideOffset;

  const positionerProps = {
    align,
    alignOffset,
    anchor,
    arrowPadding,
    collisionAvoidance,
    collisionBoundary,
    collisionPadding,
    positionMethod,
    side,
    sideOffset: adjustedSideOffset,
    sticky,
    trackAnchor,
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        {...positionerProps}
        data-slot="popover-positioner"
      >
        <PopoverPrimitive.Popup
          className={cn(
            'bg-popover text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden',
            className,
          )}
          data-slot="popover-content"
          {...popupProps}
        >
          {showArrow && <PopoverArrow />}
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverArrow({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Arrow>) {
  return (
    <PopoverPrimitive.Arrow
      className={cn(
        'data-[side=bottom]:top-[-6px] data-[side=left]:right-[-11px] data-[side=right]:left-[-11px] data-[side=top]:bottom-[-6px]',
        'data-[side=left]:rotate-90 data-[side=right]:-rotate-90 data-[side=top]:rotate-180',
        className,
      )}
      data-slot="popover-arrow"
      {...props}
    >
      <svg fill="none" height="10" viewBox="0 0 20 10" width="20">
        <path
          className="fill-popover"
          d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        />
        <path
          className="fill-border dark:fill-none"
          d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436
           - 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        />
        <path
          className="dark:fill-border"
          d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591
           - 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        />
      </svg>
    </PopoverPrimitive.Arrow>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
