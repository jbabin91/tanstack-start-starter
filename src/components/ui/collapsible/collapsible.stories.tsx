import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { isElementVisible } from '@/test/utils';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A collapsible content area built on top of Radix UI Collapsible. Useful for creating expandable sections, FAQ items, or any content that should be hidden/shown on demand.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button className="justify-between p-0" variant="text">
          Can I use this with other UI libraries?
          <Icons.chevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="text-muted-foreground text-sm">
          Yes, this collapsible component is built with Radix UI primitives and
          can be integrated with any React-based UI library or custom design
          system.
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic collapsible with a trigger button and content area.',
      },
    },
  },
};

export const WithCard: Story = {
  render: () => (
    <Card>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer">
            <CardTitle className="flex items-center justify-between">
              Account Details
              <Icons.chevronDown className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-muted-foreground text-sm">
                  user@example.com
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Login</Label>
                <p className="text-muted-foreground text-sm">2 hours ago</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Account Type</Label>
                <p className="text-muted-foreground text-sm">Premium</p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Collapsible integrated within a card component.',
      },
    },
  },
};

export const MultipleItems: Story = {
  render: () => {
    const faqs = [
      {
        question: 'What is TanStack Start?',
        answer:
          'TanStack Start is a full-stack React framework that provides type-safe server functions, file-based routing, and seamless client-server integration.',
      },
      {
        question: 'How do I get started?',
        answer:
          'You can get started by installing TanStack Start via npm or yarn, then create your first route and server function. Check the official documentation for detailed setup instructions.',
      },
      {
        question: 'Is it production ready?',
        answer:
          'TanStack Start is actively being developed and is approaching stable release. Many features are production-ready, but check the changelog for the latest updates.',
      },
    ];

    return (
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <Card key={`faq-${index}`}>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <CardHeader className="hover:bg-muted/50 cursor-pointer">
                  <CardTitle className="flex items-center justify-between text-base">
                    {faq.question}
                    <Icons.chevronDown className="h-4 w-4 transition-transform duration-200" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple collapsible items in a FAQ-style layout.',
      },
    },
  },
};

export const ControlledState: Story = {
  render: function ControlledStateStory() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Collapse' : 'Expand'}
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setIsOpen(true)}>
            Force Open
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setIsOpen(false)}>
            Force Close
          </Button>
        </div>
        <Card>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="hover:bg-muted/50 cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  Settings Panel
                  <Icons.chevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dark Mode</span>
                    <Button size="sm" variant="outlined">
                      Toggle
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notifications</span>
                    <Button size="sm" variant="outlined">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Privacy</span>
                    <Button size="sm" variant="outlined">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Collapsible with controlled state and external controls.',
      },
    },
  },
};

export const WithCustomAnimation: Story = {
  render: () => (
    <Card>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
            <CardTitle className="flex items-center justify-between">
              Advanced Configuration
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-normal">
                  Click to expand
                </span>
                <Icons.chevronDown className="h-4 w-4 transition-transform duration-300" />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="bg-muted rounded-md p-3">
                <h4 className="text-sm font-medium">API Configuration</h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Configure your API endpoints and authentication
                </p>
              </div>
              <div className="bg-muted rounded-md p-3">
                <h4 className="text-sm font-medium">Database Settings</h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Manage your database connection and queries
                </p>
              </div>
              <div className="bg-muted rounded-md p-3">
                <h4 className="text-sm font-medium">Performance</h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Optimize caching and response times
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Collapsible with custom animations and enhanced styling.',
      },
    },
  },
};

export const NestedCollapsible: Story = {
  render: () => (
    <Card>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer">
            <CardTitle className="flex items-center justify-between">
              Project Structure
              <Icons.chevronDown className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-2 pt-0">
            <div className="border-muted border-l-2 pl-4">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    className="h-8 justify-start p-0 font-normal"
                    variant="text"
                  >
                    <Icons.chevronRight className="mr-2 h-3 w-3" />
                    📁 src/
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1 pl-5">
                  <div className="text-muted-foreground space-y-1 text-sm">
                    <div>📄 main.tsx</div>
                    <div>📄 App.tsx</div>
                    <div>📁 components/</div>
                    <div>📁 pages/</div>
                    <div>📁 utils/</div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <div className="border-muted border-l-2 pl-4">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    className="h-8 justify-start p-0 font-normal"
                    variant="text"
                  >
                    <Icons.chevronRight className="mr-2 h-3 w-3" />
                    📁 public/
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1 pl-5">
                  <div className="text-muted-foreground space-y-1 text-sm">
                    <div>📄 index.html</div>
                    <div>📄 favicon.ico</div>
                    <div>📁 images/</div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <div className="text-muted-foreground border-muted border-l-2 pl-4 text-sm">
              <div>📄 package.json</div>
              <div>📄 vite.config.ts</div>
              <div>📄 tsconfig.json</div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Nested collapsible components for hierarchical content.',
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-2">
      {[
        {
          icon: Icons.user,
          title: 'User Management',
          content:
            'Manage user accounts, permissions, and authentication settings.',
        },
        {
          icon: Icons.settings,
          title: 'System Configuration',
          content:
            'Configure system-wide settings, integrations, and preferences.',
        },
        {
          icon: Icons.shield,
          title: 'Security Settings',
          content: 'Manage security policies, API keys, and access controls.',
        },
      ].map((item, index) => (
        <Card key={`icon-item-${index}`}>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <CardHeader className="hover:bg-muted/50 cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
                      <item.icon className="text-primary h-4 w-4" />
                    </div>
                    {item.title}
                  </div>
                  <Icons.chevronDown className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm">{item.content}</p>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Collapsible items with icons for better visual hierarchy.',
      },
    },
  },
};

export const MinimalText: Story = {
  render: () => (
    <div className="space-y-4">
      <Collapsible>
        <CollapsibleTrigger className="hover:text-primary flex items-center gap-2 text-sm font-medium">
          <Icons.chevronRight className="h-3 w-3 transition-transform duration-200" />
          Show more details
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="text-muted-foreground pl-5 text-sm">
            <p>
              This is additional information that was hidden by default. You can
              put any content here that should be revealed when the user clicks
              the trigger.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className="text-primary hover:text-primary/80 text-sm font-medium">
          View changelog →
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="text-muted-foreground space-y-1 text-sm">
            <div>• Fixed navigation bug</div>
            <div>• Improved performance</div>
            <div>• Updated dependencies</div>
            <div>• Added new features</div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Minimal text-based collapsible components.',
      },
    },
  },
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [openItems, setOpenItems] = useState<number[]>([]);

    const toggleItem = (index: number) => {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index],
      );
    };

    const items = [
      'Getting Started',
      'Installation Guide',
      'Advanced Configuration',
    ];

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outlined"
            onClick={() =>
              setOpenItems(Array.from({ length: items.length }, (_, i) => i))
            }
          >
            Expand All
          </Button>
          <Button size="sm" variant="outlined" onClick={() => setOpenItems([])}>
            Collapse All
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={`interactive-item-${index}`}>
              <Collapsible
                open={openItems.includes(index)}
                onOpenChange={() => toggleItem(index)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="hover:bg-muted/50 cursor-pointer">
                    <CardTitle className="flex items-center justify-between text-base">
                      {item}
                      <Icons.chevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openItems.includes(index) ? 'rotate-180' : ''
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm">
                      Content for {item.toLowerCase()}. This section contains
                      detailed information about the selected topic.
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify initial state - all collapsed
    // Find the collapsible triggers by their data-slot and text content
    const gettingStartedTrigger = canvas
      .getByText('Getting Started')
      .closest('[data-slot="collapsible-trigger"]');
    const installationTrigger = canvas
      .getByText('Installation Guide')
      .closest('[data-slot="collapsible-trigger"]');
    const advancedTrigger = canvas
      .getByText('Advanced Configuration')
      .closest('[data-slot="collapsible-trigger"]');

    if (!gettingStartedTrigger || !installationTrigger || !advancedTrigger) {
      throw new TypeError('Expected to find all collapsible triggers');
    }

    expect(gettingStartedTrigger).toBeInTheDocument();
    expect(installationTrigger).toBeInTheDocument();
    expect(advancedTrigger).toBeInTheDocument();

    // Test expanding individual items
    await userEvent.click(gettingStartedTrigger);

    // Wait for content to be visible
    await waitFor(() => {
      expect(canvas.getByText(/content for getting started/i)).toBeVisible();
    });

    // Test expand all button
    const expandAllButton = canvas.getByRole('button', { name: /expand all/i });
    await userEvent.click(expandAllButton);

    // Verify all items are expanded
    await waitFor(() => {
      expect(canvas.getByText(/content for getting started/i)).toBeVisible();
      expect(canvas.getByText(/content for installation guide/i)).toBeVisible();
      expect(
        canvas.getByText(/content for advanced configuration/i),
      ).toBeVisible();
    });

    // Test collapse all button
    const collapseAllButton = canvas.getByRole('button', {
      name: /collapse all/i,
    });
    await userEvent.click(collapseAllButton);

    // Verify all content is collapsed (content should not be visible)
    await waitFor(() => {
      const gettingStartedContent: HTMLElement | null = canvas.queryByText(
        /content for getting started/i,
      );
      const installationContent: HTMLElement | null = canvas.queryByText(
        /content for installation guide/i,
      );
      const configContent: HTMLElement | null = canvas.queryByText(
        /content for advanced configuration/i,
      );

      // Content should be either null or not visible after collapse
      expect(gettingStartedContent).toSatisfy(
        (el) => el === null || !isElementVisible(el),
      );
      expect(installationContent).toSatisfy(
        (el) => el === null || !isElementVisible(el),
      );
      expect(configContent).toSatisfy(
        (el) => el === null || !isElementVisible(el),
      );
    });

    // Verify collapsible structure
    const collapsibles = canvasElement.querySelectorAll(
      '[data-slot="collapsible"]',
    );
    expect(collapsibles).toHaveLength(3);

    // Verify all have proper data attributes
    for (const collapsible of collapsibles) {
      expect(collapsible).toHaveAttribute('data-slot', 'collapsible');
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive collapsible with expand/collapse all controls and state management.',
      },
    },
  },
};
