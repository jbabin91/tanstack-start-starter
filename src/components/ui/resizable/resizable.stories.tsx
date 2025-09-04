import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './resizable';

const meta = {
  title: 'UI/Layout/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A resizable panel component built on react-resizable-panels that allows users to adjust panel sizes by dragging handles. Supports both horizontal and vertical layouts with customizable handles. WCAG AA compliant with keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[400px] w-[600px] rounded-lg border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { direction: 'horizontal' },
  render: () => (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={20}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h3 className="mb-2 font-semibold">Left Panel</h3>
            <p className="text-muted-foreground text-sm">
              This panel can be resized by dragging the handle.
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70} minSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h3 className="mb-2 font-semibold">Right Panel</h3>
            <p className="text-muted-foreground text-sm">
              The main content area that adjusts as the left panel is resized.
            </p>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check panels are visible
    expect(canvas.getByText('Left Panel')).toBeVisible();
    expect(canvas.getByText('Right Panel')).toBeVisible();

    // The resizable handle should be present and focusable
    const handle = canvas.getByRole('separator');
    expect(handle).toBeVisible();
    expect(handle).toHaveAttribute('tabindex', '0');
  },
};

export const Vertical: Story = {
  args: { direction: 'horizontal' },
  render: () => (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={40} minSize={25}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h3 className="mb-2 font-semibold">Top Panel</h3>
            <p className="text-muted-foreground text-sm">
              Header or navigation area that can be resized vertically.
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60} minSize={30}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h3 className="mb-2 font-semibold">Bottom Panel</h3>
            <p className="text-muted-foreground text-sm">
              Main content area that expands and contracts based on the top
              panel size.
            </p>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check vertical layout panels
    expect(canvas.getByText('Top Panel')).toBeVisible();
    expect(canvas.getByText('Bottom Panel')).toBeVisible();

    // Verify separator is present
    const handle = canvas.getByRole('separator');
    expect(handle).toBeVisible();
  },
};

export const WithHandles: Story = {
  args: { direction: 'horizontal' },
  render: () => (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <h4 className="mb-1 font-medium">Sidebar</h4>
            <p className="text-muted-foreground text-xs">Navigation</p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <h4 className="mb-1 font-medium">Main Content</h4>
            <p className="text-muted-foreground text-xs">Primary workspace</p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <h4 className="mb-1 font-medium">Inspector</h4>
            <p className="text-muted-foreground text-xs">Properties panel</p>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check all three panels
    expect(canvas.getByText('Sidebar')).toBeVisible();
    expect(canvas.getByText('Main Content')).toBeVisible();
    expect(canvas.getByText('Inspector')).toBeVisible();

    // Should have two handles with grip icons
    const handles = canvas.getAllByRole('separator');
    expect(handles).toHaveLength(2);
    for (const handle of handles) {
      expect(handle).toBeVisible();
    }
  },
};

export const NestedLayout: Story = {
  args: { direction: 'horizontal' },
  render: () => (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={20}>
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <h4 className="mb-1 font-medium">File Explorer</h4>
            <p className="text-muted-foreground text-xs">
              Project files and folders
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70} minSize={40}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} minSize={40}>
            <div className="flex h-full items-center justify-center p-4">
              <div className="text-center">
                <h4 className="mb-1 font-medium">Code Editor</h4>
                <p className="text-muted-foreground text-xs">
                  Main editing area with syntax highlighting
                </p>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="flex h-full items-center justify-center p-4">
              <div className="text-center">
                <h4 className="mb-1 font-medium">Terminal</h4>
                <p className="text-muted-foreground text-xs">
                  Command line interface
                </p>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check all nested panels
    expect(canvas.getByText('File Explorer')).toBeVisible();
    expect(canvas.getByText('Code Editor')).toBeVisible();
    expect(canvas.getByText('Terminal')).toBeVisible();

    // Should have handles for both horizontal and vertical splits
    const handles = canvas.getAllByRole('separator');
    expect(handles.length).toBeGreaterThanOrEqual(2);
  },
};

export const MinMaxConstraints: Story = {
  args: { direction: 'horizontal' },
  render: () => (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} maxSize={40} minSize={15}>
        <div className="bg-muted/20 flex h-full flex-col items-center justify-center p-4">
          <div className="text-center">
            <h4 className="mb-2 font-medium">Constrained Panel</h4>
            <div className="text-muted-foreground space-y-1 text-xs">
              <div>Min: 15%</div>
              <div>Max: 40%</div>
              <div>Default: 20%</div>
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={30}>
        <div className="flex h-full items-center justify-center p-4">
          <div className="text-center">
            <h4 className="mb-2 font-medium">Flexible Panel</h4>
            <p className="text-muted-foreground text-xs">
              Adapts to available space with minimum 30% width
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} maxSize={35} minSize={20}>
        <div className="bg-muted/20 flex h-full flex-col items-center justify-center p-4">
          <div className="text-center">
            <h4 className="mb-2 font-medium">Fixed Range</h4>
            <div className="text-muted-foreground space-y-1 text-xs">
              <div>Min: 20%</div>
              <div>Max: 35%</div>
              <div>Default: 25%</div>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify constraint labels
    expect(canvas.getByText('Constrained Panel')).toBeVisible();
    expect(canvas.getByText('Flexible Panel')).toBeVisible();
    expect(canvas.getByText('Fixed Range')).toBeVisible();

    // Check constraint information is displayed
    expect(canvas.getByText('Min: 15%')).toBeVisible();
    expect(canvas.getByText('Max: 40%')).toBeVisible();
    expect(canvas.getByText('Min: 20%')).toBeVisible();
    expect(canvas.getByText('Max: 35%')).toBeVisible();
  },
};

export const CodeEditorLayout: Story = {
  args: { direction: 'horizontal' },
  render: () => (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={15} maxSize={25} minSize={10}>
        <div className="bg-muted/30 flex h-full flex-col p-3">
          <h4 className="mb-3 text-sm font-medium">Explorer</h4>
          <div className="text-muted-foreground space-y-2 text-xs">
            <div className="hover:text-foreground cursor-pointer">📁 src/</div>
            <div className="hover:text-foreground cursor-pointer pl-3">
              📄 App.tsx
            </div>
            <div className="hover:text-foreground cursor-pointer pl-3">
              📄 main.tsx
            </div>
            <div className="hover:text-foreground cursor-pointer">
              📁 components/
            </div>
            <div className="hover:text-foreground cursor-pointer pl-3">
              📄 Button.tsx
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60} minSize={40}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="flex h-full flex-col p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-muted text-muted-foreground rounded-sm px-2 py-1 text-xs">
                  App.tsx
                </div>
              </div>
              <div className="bg-muted/20 flex-1 rounded-sm p-3 font-mono text-xs">
                <div>import React from &apos;react&apos;;</div>
                <div>import Button from &apos;./components/Button&apos;;</div>
                <div className="mt-2">function App() {`{`}</div>
                <div className="ml-2">return (</div>
                <div className="ml-4">&lt;div&gt;</div>
                <div className="ml-6">
                  &lt;Button&gt;Click me&lt;/Button&gt;
                </div>
                <div className="ml-4">&lt;/div&gt;</div>
                <div className="ml-2">);</div>
                <div>{`}`}</div>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25} minSize={15}>
            <div className="flex h-full flex-col bg-black p-3 font-mono text-xs text-green-400">
              <div className="mb-2 font-medium text-white">Terminal</div>
              <div className="space-y-1">
                <div>$ npm run dev</div>
                <div className="text-blue-400">
                  ✓ Local: http://localhost:3000
                </div>
                <div className="text-yellow-400">
                  ✓ Network: http://192.168.1.100:3000
                </div>
                <div className="mt-2">
                  <span className="text-green-400">$</span>
                  <span className="ml-1 animate-pulse">_</span>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="flex h-full flex-col p-3">
          <h4 className="mb-3 text-sm font-medium">Properties</h4>
          <div className="text-muted-foreground space-y-3 text-xs">
            <div>
              <div className="mb-1 font-medium">Element</div>
              <div>&lt;Button&gt;</div>
            </div>
            <div>
              <div className="mb-1 font-medium">Props</div>
              <div>variant: primary</div>
              <div>size: medium</div>
              <div>disabled: false</div>
            </div>
            <div>
              <div className="mb-1 font-medium">Styles</div>
              <div>padding: 8px 16px</div>
              <div>border-radius: 4px</div>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check main sections of IDE layout
    expect(canvas.getByText('Explorer')).toBeVisible();
    expect(canvas.getByText('App.tsx')).toBeVisible();
    expect(canvas.getByText('Terminal')).toBeVisible();
    expect(canvas.getByText('Properties')).toBeVisible();

    // Check file tree
    expect(canvas.getByText('📁 src/')).toBeVisible();
    expect(canvas.getByText('📄 Button.tsx')).toBeVisible();

    // Check terminal content
    expect(canvas.getByText('$ npm run dev')).toBeVisible();

    // Check properties panel
    expect(canvas.getByText('variant: primary')).toBeVisible();
  },
};
