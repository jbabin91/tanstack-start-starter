import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { Icons } from '@/components/icons';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';

const meta = {
  title: 'UI/Navigation/Menubar',
  component: Menubar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A horizontal menu bar with multiple menu triggers. Built on top of Radix UI Menubar with support for sub-menus, checkboxes, radio groups, and keyboard shortcuts.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New File</MenubarItem>
          <MenubarItem>Open File</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Save</MenubarItem>
          <MenubarItem>Save As...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithShortcuts: Story = {
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New File
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Open File
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Save
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Save As...
            <MenubarShortcut>⌘⇧S</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo
            <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo
            <MenubarShortcut>⌘Y</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Cut
            <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copy
            <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Paste
            <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>
          <Icons.file className="mr-2 size-4" />
          File
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Icons.fileText className="size-4" />
            New Document
          </MenubarItem>
          <MenubarItem>
            <Icons.folder className="size-4" />
            Open Folder
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Icons.save className="size-4" />
            Save
          </MenubarItem>
          <MenubarItem variant="error">
            <Icons.trash className="size-4" />
            Delete
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          <Icons.edit className="mr-2 size-4" />
          Edit
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Icons.undo className="size-4" />
            Undo
          </MenubarItem>
          <MenubarItem>
            <Icons.redo className="size-4" />
            Redo
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithCheckboxes: Story = {
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Panels</MenubarLabel>
          <MenubarCheckboxItem checked>Show Sidebar</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show Status Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Show Activity Bar</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Display</MenubarLabel>
          <MenubarCheckboxItem>Full Screen</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>Word Wrap</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithRadioGroup: Story = {
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Theme</MenubarLabel>
          <MenubarRadioGroup value="light">
            <MenubarRadioItem value="light">Light Theme</MenubarRadioItem>
            <MenubarRadioItem value="dark">Dark Theme</MenubarRadioItem>
            <MenubarRadioItem value="auto">System Theme</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarLabel>Layout</MenubarLabel>
          <MenubarRadioGroup value="grid">
            <MenubarRadioItem value="list">List View</MenubarRadioItem>
            <MenubarRadioItem value="grid">Grid View</MenubarRadioItem>
            <MenubarRadioItem value="table">Table View</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithSubmenus: Story = {
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New File</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Open Recent</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>project-1.txt</MenubarItem>
              <MenubarItem>project-2.txt</MenubarItem>
              <MenubarItem>project-3.txt</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Clear Recent</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Save</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Export As</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>HTML</MenubarItem>
              <MenubarItem>Markdown</MenubarItem>
              <MenubarItem>Plain Text</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find & Replace</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Find</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Replace</MenubarItem>
              <MenubarItem>Replace All</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const ApplicationMenu: Story = {
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Icons.plus className="size-4" />
            New
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Icons.folder className="size-4" />
            Open
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger inset>Open Recent</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Document 1.pdf</MenubarItem>
              <MenubarItem>Document 2.docx</MenubarItem>
              <MenubarItem>Presentation.pptx</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>More...</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            <Icons.save className="size-4" />
            Save
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Save As...
            <MenubarShortcut>⌘⇧S</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="error">
            <Icons.x className="size-4" />
            Close
            <MenubarShortcut>⌘W</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Icons.undo className="size-4" />
            Undo
            <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Icons.redo className="size-4" />
            Redo
            <MenubarShortcut>⌘Y</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Icons.cut className="size-4" />
            Cut
            <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Icons.copy className="size-4" />
            Copy
            <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Icons.clipboard className="size-4" />
            Paste
            <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Icons.search className="size-4" />
            Find
            <MenubarShortcut>⌘F</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>
            <Icons.panelLeft className="size-4" />
            Show Sidebar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem>
            <Icons.terminal className="size-4" />
            Show Terminal
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked>
            <Icons.activity className="size-4" />
            Show Activity Bar
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Appearance</MenubarLabel>
          <MenubarRadioGroup value="comfortable">
            <MenubarRadioItem value="compact">Compact</MenubarRadioItem>
            <MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
            <MenubarRadioItem value="spacious">Spacious</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem>
            <Icons.maximize className="size-4" />
            Toggle Fullscreen
            <MenubarShortcut>F11</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            <Icons.help className="size-4" />
            Documentation
          </MenubarItem>
          <MenubarItem>
            <Icons.keyboard className="size-4" />
            Keyboard Shortcuts
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Icons.bug className="size-4" />
            Report Bug
          </MenubarItem>
          <MenubarItem>
            <Icons.messageSquare className="size-4" />
            Send Feedback
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Icons.info className="size-4" />
            About
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const Interactive: Story = {
  args: {
    onValueChange: fn(),
  },
  render: (args) => (
    <Menubar {...args}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={fn()}>
            New File
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onSelect={fn()}>
            Open File
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onSelect={fn()}>
            Save
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked onCheckedChange={fn()}>
            Show Sidebar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem onCheckedChange={fn()}>
            Show Status Bar
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarRadioGroup value="grid" onValueChange={fn()}>
            <MenubarRadioItem value="list">List View</MenubarRadioItem>
            <MenubarRadioItem value="grid">Grid View</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Tools</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Export</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onSelect={fn()}>Export as PDF</MenubarItem>
              <MenubarItem onSelect={fn()}>Export as HTML</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem variant="error" onSelect={fn()}>
            Clear All Data
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test File menu
    await userEvent.click(canvas.getByRole('menuitem', { name: 'File' }));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });

    const newFileItem = screen.getByRole('menuitem', { name: /New File/ });
    expect(newFileItem).toBeVisible();
    expect(screen.getByText('⌘N')).toBeVisible();

    // Click menu item
    await userEvent.click(newFileItem);

    // Test View menu with checkboxes and radio
    await userEvent.click(canvas.getByRole('menuitem', { name: 'View' }));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });

    // Test checkbox
    const sidebarCheckbox = screen.getByRole('menuitemcheckbox', {
      name: 'Show Sidebar',
    });
    expect(sidebarCheckbox).toBeVisible();
    expect(sidebarCheckbox).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(sidebarCheckbox);

    // Reopen View menu after checkbox click (which closes the menu)
    await userEvent.click(canvas.getByRole('menuitem', { name: 'View' }));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });

    // Test radio group - wait for it to appear and ensure menu is open
    await waitFor(() => {
      const listViewRadio = screen.getByRole('menuitemradio', {
        name: 'List View',
      });
      expect(listViewRadio).toBeVisible();
      return listViewRadio;
    });

    const listViewRadio = screen.getByRole('menuitemradio', {
      name: 'List View',
    });
    await userEvent.click(listViewRadio);

    // Test submenu
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Tools' }));

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeVisible();
    });

    const exportTrigger = screen.getByRole('menuitem', { name: 'Export' });
    await userEvent.hover(exportTrigger);

    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', { name: 'Export as PDF' }),
      ).toBeVisible();
    });

    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Export as PDF' }),
    );

    // Verify component structure
    const menubar = canvasElement.querySelector('[data-slot="menubar"]');
    expect(menubar).toBeInTheDocument();

    const triggers = canvasElement.querySelectorAll(
      '[data-slot="menubar-trigger"]',
    );
    expect(triggers.length).toBe(3);
  },
};
