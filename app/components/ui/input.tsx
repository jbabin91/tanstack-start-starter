import * as React from 'react';

import { cn } from '@/lib/utils.ts';

// https://css-tricks.com/everything-you-ever-wanted-to-know-about-inputmode/
const defaultInputModes: Partial<
  Record<React.HTMLInputTypeAttribute, React.ComponentProps<'input'>['inputMode']>
> = {
  email: 'email',
  number: 'numeric',
  tel: 'tel',
  text: 'text',
  url: 'url',
};

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      autoComplete="off"
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-shadow file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      inputMode={defaultInputModes[props.type ?? 'text']}
      spellCheck={false}
      type="text"
      onWheel={(e) => e.currentTarget.blur()}
      {...props}
    />
  );
}

export { Input };
