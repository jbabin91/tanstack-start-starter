import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { isElementVisible } from '@/test/utils';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu';

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/Context Menu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A context menu component built on top of Radix UI Context Menu. Displays a menu to the user on right-click or keyboard activation, providing contextual actions and options.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-96 w-96 items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="border-border hover:bg-muted flex h-32 w-32 cursor-pointer items-center justify-center rounded-md border border-dashed text-sm">
        Right click me
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Icons.user className="mr-2" />
          Profile
        </ContextMenuItem>
        <ContextMenuItem>
          <Icons.settings className="mr-2" />
          Settings
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Icons.help className="mr-2" />
          Help
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Basic context menu triggered by right-clicking the target area.',
      },
    },
  },
};

export const WithShortcuts: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="border-border hover:bg-muted flex h-32 w-48 cursor-pointer items-center justify-center rounded-md border border-dashed text-sm">
        Right click for menu with shortcuts
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Icons.copy className="mr-2" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Icons.scissors className="mr-2" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Icons.clipboard className="mr-2" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Icons.undo className="mr-2" />
          Undo
          <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Icons.redo className="mr-2" />
          Redo
          <ContextMenuShortcut>⌘⇧Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="error">
          <Icons.trash className="mr-2" />
          Delete
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Context menu with keyboard shortcuts and error variant item.',
      },
    },
  },
};

export const WithCheckboxItems: Story = {
  render: function WithCheckboxItemsStory() {
    const [checkedItems, setCheckedItems] = useState({
      bold: false,
      italic: false,
      underline: true,
    });

    const handleCheckedChange = (item: keyof typeof checkedItems) => {
      setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger className="border-border hover:bg-muted flex h-32 w-48 cursor-pointer items-center justify-center rounded-md border border-dashed text-sm">
          Right click for formatting options
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Text Formatting</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={checkedItems.bold}
            onCheckedChange={() => handleCheckedChange('bold')}
          >
            <Icons.bold className="mr-2" />
            Bold
            <ContextMenuShortcut>⌘B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={checkedItems.italic}
            onCheckedChange={() => handleCheckedChange('italic')}
          >
            <Icons.italic className="mr-2" />
            Italic
            <ContextMenuShortcut>⌘I</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={checkedItems.underline}
            onCheckedChange={() => handleCheckedChange('underline')}
          >
            <Icons.underline className="mr-2" />
            Underline
            <ContextMenuShortcut>⌘U</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Icons.palette className="mr-2" />
            Text Color...
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Context menu with checkbox items for toggling formatting options.',
      },
    },
  },
};

export const WithRadioItems: Story = {
  render: function WithRadioItemsStory() {
    const [alignment, setAlignment] = useState('left');

    return (
      <ContextMenu>
        <ContextMenuTrigger className="border-border hover:bg-muted flex h-32 w-48 cursor-pointer items-center justify-center rounded-md border border-dashed text-sm">
          Right click for alignment options
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Text Alignment</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={alignment} onValueChange={setAlignment}>
            <ContextMenuRadioItem value="left">
              <Icons.alignLeft className="mr-2" />
              Left
              <ContextMenuShortcut>⌘⇧L</ContextMenuShortcut>
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="center">
              <Icons.alignCenter className="mr-2" />
              Center
              <ContextMenuShortcut>⌘⇧C</ContextMenuShortcut>
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="right">
              <Icons.alignRight className="mr-2" />
              Right
              <ContextMenuShortcut>⌘⇧R</ContextMenuShortcut>
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="justify">
              <Icons.alignJustify className="mr-2" />
              Justify
              <ContextMenuShortcut>⌘⇧J</ContextMenuShortcut>
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Icons.settings className="mr-2" />
            More Options...
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Context menu with radio items for selecting alignment options.',
      },
    },
  },
};

export const WithSubmenus: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="border-border hover:bg-muted flex h-32 w-48 cursor-pointer items-center justify-center rounded-md border border-dashed text-sm">
        Right click for nested menus
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Icons.file className="mr-2" />
          New File
          <ContextMenuShortcut>⌘N</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Icons.folder className="mr-2" />
            New Folder
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>
              <Icons.folder className="mr-2" />
              Empty Folder
            </ContextMenuItem>
            <ContextMenuItem>
              <Icons.folderOpen className="mr-2" />
              From Template
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <Icons.git className="mr-2" />
              Git Repository
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Icons.share className="mr-2" />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>
              <Icons.mail className="mr-2" />
              Email Link
            </ContextMenuItem>
            <ContextMenuItem>
              <Icons.copy className="mr-2" />
              Copy Link
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <Icons.users className="mr-2" />
              Invite People
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="error">
          <Icons.trash className="mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Context menu with nested submenus for hierarchical actions.',
      },
    },
  },
};

export const FileExplorer: Story = {
  render: function FileExplorerStory() {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const files = [
      { name: 'index.html', type: 'file', icon: Icons.fileText },
      { name: 'styles.css', type: 'file', icon: Icons.file },
      { name: 'script.js', type: 'file', icon: Icons.fileText },
      { name: 'images', type: 'folder', icon: Icons.folder },
    ];

    return (
      <div className="w-full max-w-md space-y-2">
        <p className="text-muted-foreground text-sm">
          Right-click any file or folder:
        </p>
        <div className="border-border rounded-lg border p-4">
          {files.map((file, index) => (
            <ContextMenu key={`file-${index}`}>
              <ContextMenuTrigger
                className={`hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded p-2 text-left text-sm ${
                  selectedFile === file.name ? 'bg-muted' : ''
                }`}
              >
                <file.icon className="h-4 w-4" />
                {file.name}
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onSelect={() => setSelectedFile(file.name)}>
                  <Icons.mousePointer className="mr-2" />
                  Select
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>
                  <Icons.copy className="mr-2" />
                  Copy
                  <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem>
                  <Icons.scissors className="mr-2" />
                  Cut
                  <ContextMenuShortcut>⌘X</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem>
                  <Icons.files className="mr-2" />
                  Duplicate
                  <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>
                  <Icons.edit className="mr-2" />
                  Rename
                  <ContextMenuShortcut>F2</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem>
                  <Icons.info className="mr-2" />
                  Properties
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem variant="error">
                  <Icons.trash className="mr-2" />
                  Delete
                  <ContextMenuShortcut>Del</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
        {selectedFile && (
          <div className="border-border bg-muted/50 rounded border p-2">
            <p className="text-sm">Selected: {selectedFile}</p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'File explorer-style context menu with selection state.',
      },
    },
  },
};

export const ImageEditor: Story = {
  render: function ImageEditorStory() {
    const [filters, setFilters] = useState({
      brightness: false,
      contrast: false,
      saturation: false,
    });

    const [cropMode, setCropMode] = useState('none');

    const handleFilterToggle = (filter: keyof typeof filters) => {
      setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger className="border-border hover:bg-muted flex h-48 w-48 cursor-pointer items-center justify-center rounded-lg border bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-medium dark:from-blue-900 dark:to-purple-900">
          🖼️ Sample Image
          <br />
          <span className="text-xs opacity-60">Right click to edit</span>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Edit Image</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Icons.crop className="mr-2" />
              Crop
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup
                value={cropMode}
                onValueChange={setCropMode}
              >
                <ContextMenuRadioItem value="square">
                  Square (1:1)
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="landscape">
                  Landscape (16:9)
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="portrait">
                  Portrait (9:16)
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="custom">
                  Custom
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuLabel inset>Filters</ContextMenuLabel>
            <ContextMenuCheckboxItem
              checked={filters.brightness}
              onCheckedChange={() => handleFilterToggle('brightness')}
            >
              <Icons.sun className="mr-2" />
              Brightness
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={filters.contrast}
              onCheckedChange={() => handleFilterToggle('contrast')}
            >
              <Icons.contrast className="mr-2" />
              Contrast
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={filters.saturation}
              onCheckedChange={() => handleFilterToggle('saturation')}
            >
              <Icons.palette className="mr-2" />
              Saturation
            </ContextMenuCheckboxItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Icons.rotateClockwise className="mr-2" />
            Rotate Right
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <Icons.rotateCounterClockwise className="mr-2" />
            Rotate Left
            <ContextMenuShortcut>⌘⇧R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Icons.download className="mr-2" />
            Export
            <ContextMenuShortcut>⌘E</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced context menu for image editing with grouped options.',
      },
    },
  },
};

export const TableCell: Story = {
  render: function TableCellStory() {
    const [selectedCells, setSelectedCells] = useState<string[]>([]);

    const handleCellSelect = (cellId: string) => {
      setSelectedCells((prev) => [...prev, cellId]);
    };

    const data = [
      ['Name', 'Role', 'Email'],
      ['John Doe', 'Developer', 'john@example.com'],
      ['Jane Smith', 'Designer', 'jane@example.com'],
      ['Bob Johnson', 'Manager', 'bob@example.com'],
    ];

    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Right-click any table cell:
        </p>
        <table className="border-border w-full border-collapse rounded border">
          <thead>
            {data.map((row, rowIndex) => {
              if (rowIndex === 0) {
                return (
                  <tr key={`header-row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <th
                        key={`header-cell-${rowIndex}-${cellIndex}`}
                        className="bg-muted border-border border p-2 text-left font-medium"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                );
              }
              return null;
            })}
          </thead>
          <tbody>
            {data.slice(1).map((row, rowIndex) => (
              <tr key={`body-row-${rowIndex}`}>
                {row.map((cell, cellIndex) => {
                  const cellId = `${rowIndex}-${cellIndex}`;
                  return (
                    <ContextMenu key={`context-cell-${cellId}`}>
                      <ContextMenuTrigger asChild>
                        <td
                          className={`border-border hover:bg-muted border p-2 ${
                            selectedCells.includes(cellId) ? 'bg-muted' : ''
                          }`}
                        >
                          {cell}
                        </td>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onSelect={() => handleCellSelect(cellId)}
                        >
                          <Icons.mousePointer className="mr-2" />
                          Select Cell
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem>
                          <Icons.copy className="mr-2" />
                          Copy
                          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Icons.clipboard className="mr-2" />
                          Paste
                          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuSub>
                          <ContextMenuSubTrigger>
                            <Icons.table className="mr-2" />
                            Insert
                          </ContextMenuSubTrigger>
                          <ContextMenuSubContent>
                            <ContextMenuItem>
                              <Icons.arrowUp className="mr-2" />
                              Row Above
                            </ContextMenuItem>
                            <ContextMenuItem>
                              <Icons.arrowDown className="mr-2" />
                              Row Below
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem>
                              <Icons.arrowLeft className="mr-2" />
                              Column Left
                            </ContextMenuItem>
                            <ContextMenuItem>
                              <Icons.arrowRight className="mr-2" />
                              Column Right
                            </ContextMenuItem>
                          </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant="error">
                          <Icons.trash className="mr-2" />
                          Delete Cell
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {selectedCells.length > 0 && (
          <div className="border-border bg-muted/50 rounded border p-2">
            <p className="text-sm">
              Selected cells: {selectedCells.join(', ')}
            </p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Context menu for table cells with table manipulation options.',
      },
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [lastAction, setLastAction] = useState<string>('');
    const [checkedItems, setCheckedItems] = useState({
      notifications: true,
      autoSave: false,
    });

    const handleAction = (action: string) => {
      setLastAction(action);
    };

    const handleCheckboxChange = (key: keyof typeof checkedItems) => {
      setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <ContextMenu>
            <ContextMenuTrigger className="border-border hover:bg-muted flex h-32 w-48 cursor-pointer items-center justify-center rounded-md border border-dashed text-sm">
              Right click me for interactive menu
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Actions</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => handleAction('refresh')}>
                <Icons.refreshCw className="mr-2" />
                Refresh
                <ContextMenuShortcut>F5</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => handleAction('save')}>
                <Icons.save className="mr-2" />
                Save
                <ContextMenuShortcut>⌘S</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Icons.settings className="mr-2" />
                  Preferences
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuCheckboxItem
                    checked={checkedItems.notifications}
                    onCheckedChange={() =>
                      handleCheckboxChange('notifications')
                    }
                  >
                    <Icons.bell className="mr-2" />
                    Notifications
                  </ContextMenuCheckboxItem>
                  <ContextMenuCheckboxItem
                    checked={checkedItems.autoSave}
                    onCheckedChange={() => handleCheckboxChange('autoSave')}
                  >
                    <Icons.save className="mr-2" />
                    Auto Save
                  </ContextMenuCheckboxItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="error"
                onSelect={() => handleAction('delete')}
              >
                <Icons.trash className="mr-2" />
                Delete
                <ContextMenuShortcut>Del</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>

        {lastAction && (
          <div className="border-border bg-muted/50 rounded border p-3">
            <p className="text-sm">
              Last action: <strong>{lastAction}</strong>
            </p>
          </div>
        )}

        <div className="border-border bg-muted/30 rounded border p-3">
          <h4 className="mb-2 text-sm font-medium">Settings:</h4>
          <div className="space-y-1">
            <p className="text-sm">
              Notifications:{' '}
              {checkedItems.notifications ? 'Enabled' : 'Disabled'}
            </p>
            <p className="text-sm">
              Auto Save: {checkedItems.autoSave ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Find the trigger area
    const trigger = canvas.getByText(/right click me for interactive menu/i);
    expect(trigger).toBeInTheDocument();

    // Right-click to open context menu (portal content)
    await userEvent.pointer([{ target: trigger, keys: '[MouseRight]' }]);

    // Wait for context menu to appear
    await waitFor(() => {
      const menu = screen.getByRole('menu');
      expect(menu).toBeVisible();
    });

    // Test basic menu item selection
    const refreshItem = screen.getByText('Refresh');
    expect(refreshItem).toBeInTheDocument();

    await userEvent.click(refreshItem);

    // Verify action was recorded
    await waitFor(() => {
      expect(canvas.getByText(/last action:.*refresh/i)).toBeVisible();
    });

    // Open menu again for submenu testing
    await userEvent.pointer([{ target: trigger, keys: '[MouseRight]' }]);

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });

    // Test submenu navigation
    const preferencesItem = screen.getByText('Preferences');
    await userEvent.hover(preferencesItem);

    // Wait for submenu to appear
    await waitFor(() => {
      const notificationsItem = screen.getByText('Notifications');
      expect(notificationsItem).toBeVisible();
    });

    // Toggle a checkbox item
    await userEvent.click(screen.getByText('Auto Save'));

    // Verify checkbox state change
    await waitFor(() => {
      expect(canvas.getByText(/auto save:.*enabled/i)).toBeVisible();
    });

    // Verify context menu structure has proper data attributes
    await userEvent.pointer([{ target: trigger, keys: '[MouseRight]' }]);

    await waitFor(() => {
      const contextMenu = screen
        .getByRole('menu')
        .closest('[data-slot="context-menu-content"]');
      expect(contextMenu).toHaveAttribute('data-slot', 'context-menu-content');
    });

    // Close menu by clicking outside
    await userEvent.click(canvas.getByText('Last action'));

    // Verify menu is closed
    await waitFor(() => {
      const menu: HTMLElement | null = screen.queryByRole('menu');
      expect(menu).toSatisfy(
        (el: HTMLElement | null) => el === null || !isElementVisible(el),
      );
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive context menu with action handling, state management, and comprehensive testing.',
      },
    },
  },
};
