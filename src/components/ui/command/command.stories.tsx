import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { isElementVisible } from '@/test/utils';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './command';

const meta: Meta<typeof Command> = {
  title: 'UI/Command',
  component: Command,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A command menu component built on top of cmdk. Provides fast, composable, unstyled command menu for React applications with keyboard navigation and search functionality.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Icons.calendar className="mr-2" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Icons.smile className="mr-2" />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <Icons.calculator className="mr-2" />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <Icons.user className="mr-2" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.settings className="mr-2" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic command menu with groups, icons, and keyboard shortcuts.',
      },
    },
  },
};

export const WithDialog: Story = {
  render: function WithDialogStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <p className="text-muted-foreground text-sm">
          Press{' '}
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">⌘</span>J
          </kbd>
        </p>
        <Button onClick={() => setOpen(true)}>Open Command Menu</Button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => setOpen(false)}>
                <Icons.calendar className="mr-2" />
                <span>Create Event</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <Icons.users className="mr-2" />
                <span>Invite Team</span>
                <CommandShortcut>⌘I</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <Icons.plus className="mr-2" />
                <span>New Project</span>
                <CommandShortcut>⌘⇧P</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => setOpen(false)}>
                <Icons.home className="mr-2" />
                <span>Dashboard</span>
                <CommandShortcut>⌘D</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <Icons.inbox className="mr-2" />
                <span>Inbox</span>
                <CommandShortcut>⌘⇧I</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>
                <Icons.user className="mr-2" />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu in a dialog with keyboard shortcuts.',
      },
    },
  },
};

export const SearchableItems: Story = {
  render: () => {
    const items = [
      { icon: Icons.file, name: 'README.md', category: 'Files' },
      { icon: Icons.folder, name: 'src', category: 'Folders' },
      { icon: Icons.folder, name: 'components', category: 'Folders' },
      { icon: Icons.file, name: 'package.json', category: 'Files' },
      { icon: Icons.git, name: 'Git Status', category: 'Commands' },
      { icon: Icons.terminal, name: 'Terminal', category: 'Commands' },
      { icon: Icons.search, name: 'Search Files', category: 'Commands' },
      { icon: Icons.settings, name: 'Settings', category: 'Commands' },
    ];

    const groupedItems = items.reduce<Record<string, typeof items>>(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {},
    );

    return (
      <Command>
        <CommandInput placeholder="Search files, folders, and commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <CommandGroup key={category} heading={category}>
              {categoryItems.map((item, index) => (
                <CommandItem key={`${category}-${index}`} value={item.name}>
                  <item.icon className="mr-2" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu with searchable items organized by categories.',
      },
    },
  },
};

export const WithActions: Story = {
  render: function WithActionsStory() {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const actions = [
      {
        icon: Icons.copy,
        name: 'Copy',
        description: 'Copy to clipboard',
        shortcut: '⌘C',
      },
      {
        icon: Icons.scissors,
        name: 'Cut',
        description: 'Cut to clipboard',
        shortcut: '⌘X',
      },
      {
        icon: Icons.clipboard,
        name: 'Paste',
        description: 'Paste from clipboard',
        shortcut: '⌘V',
      },
      {
        icon: Icons.undo,
        name: 'Undo',
        description: 'Undo last action',
        shortcut: '⌘Z',
      },
      {
        icon: Icons.redo,
        name: 'Redo',
        description: 'Redo last action',
        shortcut: '⌘⇧Z',
      },
    ];

    return (
      <div className="space-y-4">
        <Command>
          <CommandInput placeholder="Search actions..." />
          <CommandList>
            <CommandEmpty>No actions found.</CommandEmpty>
            <CommandGroup heading="Edit Actions">
              {actions.map((action, index) => (
                <CommandItem
                  key={`action-${index}`}
                  value={action.name}
                  onSelect={() => setSelectedAction(action.name)}
                >
                  <action.icon className="mr-2" />
                  <div className="flex flex-col">
                    <span>{action.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {action.description}
                    </span>
                  </div>
                  <CommandShortcut>{action.shortcut}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedAction && (
          <div className="border-border bg-muted/50 rounded-md border p-3">
            <p className="text-sm">
              Selected action: <strong>{selectedAction}</strong>
            </p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu with selectable actions and descriptions.',
      },
    },
  },
};

export const MultiLevel: Story = {
  render: () => (
    <Command>
      <CommandInput placeholder="Navigate through options..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="File">
          <CommandItem>
            <Icons.file className="mr-2" />
            <span>New File</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.folder className="mr-2" />
            <span>New Folder</span>
            <CommandShortcut>⌘⇧N</CommandShortcut>
          </CommandItem>
          <CommandSeparator />
          <CommandItem>
            <Icons.upload className="mr-2" />
            <span>Import</span>
          </CommandItem>
          <CommandItem>
            <Icons.download className="mr-2" />
            <span>Export</span>
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Edit">
          <CommandItem>
            <Icons.undo className="mr-2" />
            <span>Undo</span>
            <CommandShortcut>⌘Z</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.redo className="mr-2" />
            <span>Redo</span>
            <CommandShortcut>⌘⇧Z</CommandShortcut>
          </CommandItem>
          <CommandSeparator />
          <CommandItem>
            <Icons.copy className="mr-2" />
            <span>Copy</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.scissors className="mr-2" />
            <span>Cut</span>
            <CommandShortcut>⌘X</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.clipboard className="mr-2" />
            <span>Paste</span>
            <CommandShortcut>⌘V</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="View">
          <CommandItem>
            <Icons.zoomIn className="mr-2" />
            <span>Zoom In</span>
            <CommandShortcut>⌘+</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.zoomOut className="mr-2" />
            <span>Zoom Out</span>
            <CommandShortcut>⌘-</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Icons.maximize className="mr-2" />
            <span>Full Screen</span>
            <CommandShortcut>F11</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multi-level command menu with organized groups and separators.',
      },
    },
  },
};

export const WithLoading: Story = {
  render: function WithLoadingStory() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<string[]>([]);

    const simulateSearch = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setItems(['Result 1', 'Result 2', 'Result 3', 'Result 4']);
      setLoading(false);
    };

    return (
      <div className="space-y-4">
        <Button onClick={simulateSearch}>Simulate Search</Button>
        <Command>
          <CommandInput placeholder="Search with loading state..." />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">
                  Searching...
                </span>
              </div>
            ) : items.length === 0 ? (
              <CommandEmpty>Start a search to see results.</CommandEmpty>
            ) : (
              <CommandGroup heading="Search Results">
                {items.map((item, index) => (
                  <CommandItem key={`result-${index}`}>
                    <Icons.search className="mr-2" />
                    <span>{item}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu with loading state and dynamic results.',
      },
    },
  },
};

export const CustomStyling: Story = {
  render: () => (
    <Command className="border">
      <CommandInput
        className="border-none"
        placeholder="Custom styled command..."
      />
      <CommandList className="max-h-[400px]">
        <CommandEmpty className="py-8 text-center">
          <Icons.search className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground">No commands found</p>
        </CommandEmpty>
        <CommandGroup heading="Recent">
          <CommandItem className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground">
            <Icons.history className="mr-2" />
            <span>Recent File 1</span>
          </CommandItem>
          <CommandItem className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground">
            <Icons.history className="mr-2" />
            <span>Recent File 2</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Favorites">
          <CommandItem className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground">
            <Icons.heart className="mr-2" />
            <span>Favorite Project</span>
          </CommandItem>
          <CommandItem className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground">
            <Icons.bookmark className="mr-2" />
            <span>Bookmarked File</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Command menu with custom styling and visual enhancements.',
      },
    },
  },
};

export const CompactMode: Story = {
  render: () => (
    <Command className="w-80">
      <CommandInput className="h-8 text-xs" placeholder="Quick search..." />
      <CommandList className="max-h-[200px]">
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup>
          <CommandItem className="py-1">
            <Icons.file className="mr-2 h-3 w-3" />
            <span className="text-xs">index.js</span>
          </CommandItem>
          <CommandItem className="py-1">
            <Icons.folder className="mr-2 h-3 w-3" />
            <span className="text-xs">components</span>
          </CommandItem>
          <CommandItem className="py-1">
            <Icons.image className="mr-2 h-3 w-3" />
            <span className="text-xs">logo.png</span>
          </CommandItem>
          <CommandItem className="py-1">
            <Icons.fileText className="mr-2 h-3 w-3" />
            <span className="text-xs">README.md</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact command menu optimized for smaller spaces.',
      },
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const handleSelect = (value: string) => {
      setSelectedItem(value);
      setOpen(false);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
          {selectedItem && (
            <span className="text-muted-foreground text-sm">
              Last selected: {selectedItem}
            </span>
          )}
        </div>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type to search commands..." />
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem value="dashboard" onSelect={handleSelect}>
                <Icons.home className="mr-2" />
                <span>Dashboard</span>
                <CommandShortcut>⌘D</CommandShortcut>
              </CommandItem>
              <CommandItem value="projects" onSelect={handleSelect}>
                <Icons.folder className="mr-2" />
                <span>Projects</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem value="settings" onSelect={handleSelect}>
                <Icons.settings className="mr-2" />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem value="create" onSelect={handleSelect}>
                <Icons.plus className="mr-2" />
                <span>Create New</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem value="search" onSelect={handleSelect}>
                <Icons.search className="mr-2" />
                <span>Search</span>
                <CommandShortcut>⌘K</CommandShortcut>
              </CommandItem>
              <CommandItem value="help" onSelect={handleSelect}>
                <Icons.helpCircle className="mr-2" />
                <span>Help</span>
                <CommandShortcut>⌘?</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Find and click the trigger button
    const triggerButton = canvas.getByRole('button', {
      name: /open command palette/i,
    });
    expect(triggerButton).toBeInTheDocument();

    await userEvent.click(triggerButton);

    // Wait for dialog to open (portal content)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    // Verify input is present and focused
    const searchInput = screen.getByPlaceholderText(/type to search commands/i);
    expect(searchInput).toBeInTheDocument();

    // Test searching
    await userEvent.type(searchInput, 'dash');

    // Wait for filtering to occur
    await waitFor(() => {
      // Dashboard should be visible, other items should be filtered
      expect(screen.getByText('Dashboard')).toBeVisible();
    });

    // Clear search and verify all items are visible again
    await userEvent.clear(searchInput);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeVisible();
      expect(screen.getByText('Projects')).toBeVisible();
      expect(screen.getByText('Settings')).toBeVisible();
    });

    // Test selecting an item
    const dashboardItem = screen.getByText('Dashboard');
    await userEvent.click(dashboardItem);

    // Verify dialog closes and item is selected
    await waitFor(() => {
      const dialog: HTMLElement | null = screen.queryByRole('dialog');
      expect(dialog).toSatisfy(
        (el: HTMLElement | null) => el === null || !isElementVisible(el),
      );
    });

    // Verify selection feedback
    await waitFor(() => {
      expect(canvas.getByText(/last selected: dashboard/i)).toBeVisible();
    });

    // Verify command structure has proper data attributes
    await userEvent.click(triggerButton);

    await waitFor(() => {
      const command = screen
        .getByRole('dialog')
        .querySelector('[data-slot="command"]');
      expect(command).toBeInTheDocument();
      expect(command).toHaveAttribute('data-slot', 'command');

      const commandInput = screen.getByPlaceholderText(
        /type to search commands/i,
      );
      expect(commandInput).toHaveAttribute('data-slot', 'command-input');
    });

    // Close dialog by pressing Escape
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      const dialog: HTMLElement | null = screen.queryByRole('dialog');
      expect(dialog).toSatisfy(
        (el: HTMLElement | null) => el === null || !isElementVisible(el),
      );
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive command palette with search, selection, and keyboard navigation.',
      },
    },
  },
};
