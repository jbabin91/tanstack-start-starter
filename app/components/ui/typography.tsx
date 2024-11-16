import * as React from 'react';

import { cn } from '@/lib/utils.ts';

function Heading1({ children, className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', className)}
      {...props}
    >
      {children}
    </h1>
  );
}

function Heading2({ children, className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function Heading3({ children, className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

function Heading4({ children, className, ...props }: React.ComponentProps<'h4'>) {
  return (
    <h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)} {...props}>
      {children}
    </h4>
  );
}

function Paragraph({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />;
}

function Blockquote({ className, ...props }: React.ComponentProps<'blockquote'>) {
  return <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props} />;
}

const Typography = {
  Blockquote,
  H1: Heading1,
  H2: Heading2,
  H3: Heading3,
  H4: Heading4,
  P: Paragraph,
};

export { Typography };
