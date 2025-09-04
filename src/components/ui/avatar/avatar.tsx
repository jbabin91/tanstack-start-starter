'use client';

import { Avatar as AvatarPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/utils/cn';

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root>;

function Avatar({ className, children, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      data-slot="avatar"
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
  );
}

type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>;

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      className={cn('aspect-square size-full', className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

type AvatarFallbackProps = React.ComponentProps<
  typeof AvatarPrimitive.Fallback
>;

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className,
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
