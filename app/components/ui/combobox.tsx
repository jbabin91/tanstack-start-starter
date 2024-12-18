// FIXME: getVirtualItems() always returns an empty array with React Compiler, 'use no memo' is a temporary solution
'use no memo';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import * as React from 'react';
import { LuCheck, LuChevronsUpDown } from 'react-icons/lu';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ScrollAreaRoot,
  ScrollBar,
  ScrollCorner,
  ScrollViewport,
} from '@/components/ui/scroll-area';
import { useDynamicNode } from '@/hooks/use-dynamic-node';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { cn, createContextFactory } from '@/lib/utils';

type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxContext = {
  selected?: ComboboxOption['value'];
  onSelectChange: (value: ComboboxOption['value']) => void;
  selectedOption?: ComboboxOption;
  open: boolean;
  setOpen: (value: boolean) => void;
  search: string;
  setSearch: (value: string) => void;
  filteredOptions: ComboboxOption[];
  parentNodeRef: (node: HTMLDivElement) => void;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
};

type ComboboxProps = {
  options: ComboboxOption[];
  selected?: ComboboxOption['value'];
  onSelectChange?: (value: ComboboxOption['value']) => void;
  defaultSelected?: ComboboxOption['value'];
  defaultOpen?: boolean;
  disabled?: boolean;
};

const [ContextProvider, useContext] = createContextFactory<ComboboxContext>();

function Combobox({ options, disabled, ...props }: ComboboxProps) {
  const [selected, onSelectChange] = useControllableState({
    defaultProp: props.defaultSelected,
    onChange: props.onSelectChange,
    prop: props.selected,
  });

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedOption = options.find((option) => option.value === selected);
  const filteredOptions = comboboxFilter(options, search);

  const [parentNode, parentNodeRef] = useDynamicNode();
  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    estimateSize: () => 32,
    getScrollElement: () => parentNode,
    overscan: 5,
  });

  const isMobile = useIsMobile();
  const DynamicView = isMobile ? MobileView : DesktopView;

  const context: ComboboxContext = {
    filteredOptions,
    onSelectChange,
    open,
    parentNodeRef,
    search,
    selected,
    selectedOption,
    setOpen,
    setSearch,
    virtualizer,
  };

  return (
    <ContextProvider value={context}>
      <DynamicView>
        <Button
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={disabled}
          role="combobox"
          variant="outline"
        >
          <span className="select-none">
            {selectedOption ? selectedOption.label : 'Select option...'}
          </span>
          <LuChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </DynamicView>
    </ContextProvider>
  );
}

function DesktopView({ children }: { children: React.ReactNode }) {
  const context = useContext();

  return (
    <Popover open={context.open} onOpenChange={context.setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <ComboboxContent />
      </PopoverContent>
    </Popover>
  );
}

function MobileView({ children }: { children: React.ReactNode }) {
  const context = useContext();

  return (
    <Drawer open={context.open} onOpenChange={context.setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only" />
        <div className="mt-4 border-t">
          <ComboboxContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ComboboxContent() {
  const context = useContext();

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search option..."
        value={context.search}
        onValueChange={context.setSearch}
      />
      <CommandList className="p-1">
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
                No option found.
              </CommandEmpty>
              <CommandGroup>
                {context.virtualizer.getVirtualItems().map((virtualItem) => {
                  const option = context.filteredOptions[virtualItem.index];

                  return (
                    <CommandItem
                      key={virtualItem.key}
                      className="flex items-center gap-2"
                      style={{
                        height: `${virtualItem.size}px`,
                        left: 0,
                        position: 'absolute',
                        top: 0,
                        transform: `translateY(${virtualItem.start}px)`,
                        width: '100%',
                      }}
                      value={option.value}
                      onSelect={(currentValue) => {
                        context.onSelectChange(
                          currentValue === context.selected ? '' : currentValue,
                        );
                        context.setSearch('');
                        context.setOpen(false);
                      }}
                    >
                      <LuCheck
                        className={cn(
                          'size-4 shrink-0',
                          context.selected === option.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span>{option.label}</span>
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

function comboboxFilter(options: ComboboxOption[], search: string) {
  return options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
}

export { Combobox };
export type { ComboboxOption, ComboboxProps };
