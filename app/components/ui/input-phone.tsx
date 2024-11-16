// https://shadcn-phone-input.vercel.app/

// FIXME: getVirtualItems() always returns an empty array with React Compiler, 'use no memo' is a temporary solution
'use no memo';

import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import * as React from 'react';
import { LuChevronsUpDown } from 'react-icons/lu';
import * as PhoneInputPrimitive from 'react-phone-number-input';
import { type Except, type Simplify } from 'type-fest';

import { Button } from '@/components/ui/button.tsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import {
  ScrollAreaRoot,
  ScrollBar,
  ScrollCorner,
  ScrollViewport,
} from '@/components/ui/scroll-area.tsx';
import { TwemojiFlag } from '@/components/ui/twemoji.tsx';
import { useDynamicNode } from '@/hooks/use-dynamic-node.ts';
import { useIsMobile } from '@/hooks/use-is-mobile.ts';
import { cn, createContextFactory } from '@/lib/utils.ts';

type InputPhoneProps = Simplify<
  Except<React.ComponentProps<'input'>, 'ref' | 'onChange' | 'value'> &
    Except<PhoneInputPrimitive.Props<typeof PhoneInputPrimitive.default>, 'onChange'> & {
      onChange?: (value: PhoneInputPrimitive.Value) => void;
    }
>;

function InputPhone({ onChange, className, ...props }: InputPhoneProps) {
  return (
    <PhoneInputPrimitive.default
      className={cn('flex', className)}
      countrySelectComponent={CountrySelect}
      flagComponent={FlagComponent}
      inputComponent={InputComponent}
      /**
       * Handles the onChange event.
       *
       * react-phone-number-input might trigger the onChange event as undefined
       * when a valid phone number is not entered.
       *
       * To prevent this, the value is coerced to an empty string.
       *
       * @param {E164Number | undefined} value - The entered value
       */
      onChange={(value) => onChange?.(value ?? ('' as PhoneInputPrimitive.Value))}
      {...props}
    />
  );
}

function InputComponent({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input className={cn('rounded-e-lg rounded-s-none', className)} {...props} />;
}

type CountrySelectOption = { label: string; value: PhoneInputPrimitive.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: PhoneInputPrimitive.Country;
  options: CountrySelectOption[];
  onChange: (value: PhoneInputPrimitive.Country) => void;
};

type CountrySelectContext = {
  value: PhoneInputPrimitive.Country;
  onChange: (value: PhoneInputPrimitive.Country) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  search: string;
  setSearch: (value: string) => void;
  countries: CountrySelectOption[];
  parentNodeRef: (node: HTMLDivElement) => void;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
};

const [ContextProvider, useContext] = createContextFactory<CountrySelectContext>();

function CountrySelect({ disabled, value, options, onChange }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const countries = options
    .filter((item) => item.value !== undefined)
    .filter(
      (item) =>
        item.label.toLowerCase().includes(search.trim().toLowerCase()) ||
        PhoneInputPrimitive.getCountryCallingCode(item.value).includes(search),
    );

  const [parentNode, parentNodeRef] = useDynamicNode();

  const virtualizer = useVirtualizer({
    count: countries.length,
    estimateSize: () => 32,
    getScrollElement: () => parentNode,
  });

  const isMobile = useIsMobile();

  const DynamicView = isMobile ? MobileView : DesktopView;

  const context: CountrySelectContext = {
    countries,
    onChange,
    open,
    parentNodeRef,
    search,
    setOpen,
    setSearch,
    value,
    virtualizer,
  };

  return (
    <ContextProvider value={context}>
      <DynamicView>
        <Button
          className={cn('flex gap-1 rounded-e-none rounded-s-lg px-3')}
          disabled={disabled}
          role="combobox"
          variant="outline"
        >
          <FlagComponent country={value} countryName={value} />
          <LuChevronsUpDown
            className={cn('-mr-2 size-4 opacity-50', disabled ? 'hidden' : 'opacity-100')}
          />
        </Button>
      </DynamicView>
    </ContextProvider>
  );
}

function DesktopView({ children }: React.PropsWithChildren) {
  const context = useContext();

  return (
    <Popover open={context.open} onOpenChange={context.setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <CountrySelectCommand />
      </PopoverContent>
    </Popover>
  );
}

function MobileView({ children }: React.PropsWithChildren) {
  const context = useContext();

  return (
    <Drawer open={context.open} onOpenChange={context.setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only" />
        <div className="mt-4 border-t">
          <CountrySelectCommand />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CountrySelectCommand() {
  const context = useContext();

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search country..."
        value={context.search}
        onValueChange={context.setSearch}
      />
      <CommandList>
        <ScrollAreaRoot className="h-72">
          <ScrollViewport ref={context.parentNodeRef}>
            <div
              style={{
                height: context.virtualizer.getTotalSize(),
                position: 'relative',
                width: '100%',
              }}
            >
              <CommandEmpty
                style={{
                  inset: 0,
                  position: 'absolute',
                }}
              >
                No country found.
              </CommandEmpty>
              <CommandGroup>
                {context.virtualizer.getVirtualItems().map((virtualItem) => {
                  const country = context.countries[virtualItem.index];

                  return (
                    <CommandItem
                      key={virtualItem.key}
                      className={cn('gap-2', country.value === context.value && 'bg-accent/50')}
                      style={{
                        height: `${virtualItem.size}px`,
                        left: 0,
                        position: 'absolute',
                        top: 0,
                        transform: `translateY(${virtualItem.start}px)`,
                        width: '100%',
                      }}
                      onSelect={() => {
                        context.onChange(country.value);
                        context.setSearch('');
                        context.setOpen(false);
                      }}
                    >
                      <FlagComponent country={country.value} countryName={country.label} />
                      <span className="flex-1 text-sm">{country.label}</span>
                      <span className="text-sm text-foreground/50">
                        {`+${PhoneInputPrimitive.getCountryCallingCode(country.value)}`}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          </ScrollViewport>
          <ScrollBar />
          <ScrollCorner />
        </ScrollAreaRoot>
      </CommandList>
    </Command>
  );
}

function FlagComponent({ country, countryName }: PhoneInputPrimitive.FlagProps) {
  return (
    <span className="h-5 w-6 overflow-hidden rounded-sm">
      {country ? (
        <TwemojiFlag alt={countryName} className="size-full" countryCode={country} />
      ) : (
        <span className="inline-block size-full bg-foreground/20" />
      )}
    </span>
  );
}

export { InputPhone };
