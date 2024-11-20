// https://gist.github.com/mjbalcueva/b21f39a8787e558d4c536bf68e267398

import * as React from 'react';
import { type IconType } from 'react-icons/lib';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { type Except } from 'type-fest';

import { PropsProvider } from '@/components/props-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function InputPassword({
  className,
  ...props
}: Except<React.ComponentProps<typeof Input>, 'type'>) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn('relative inline-block w-full', className)}>
      <Input
        autoComplete="new-password"
        className="pr-10"
        type={showPassword ? 'text' : 'password'}
        {...props}
      />
      <Button
        aria-label="Toggle password visibility"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        size="sm"
        variant="ghost"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        <PropsProvider<IconType> aria-hidden className="size-4">
          {showPassword && !props.disabled ? <LuEye /> : <LuEyeOff />}
        </PropsProvider>
      </Button>
    </div>
  );
}

export { InputPassword };
