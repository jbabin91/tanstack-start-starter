import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import { Icons } from '@/components/icons';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/utils/cn';

const meta = {
  title: 'UI/Navigation/Navigation Menu',
  component: NavigationMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A collection of links for navigating websites. Built on top of Radix UI Navigation Menu with support for dropdown content, indicators, and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex size-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
                    href="/"
                  >
                    <Icons.logo className="size-6" />
                    <div className="mt-4 mb-2 text-lg font-medium">
                      shadcn/ui
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Beautifully designed components built with Radix UI and
                      Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem
                href="/docs/primitives/alert-dialog"
                title="Alert Dialog"
              >
                A modal dialog that interrupts the user with important content.
              </ListItem>
              <ListItem href="/docs/primitives/hover-card" title="Hover Card">
                For sighted users to preview content available behind a link.
              </ListItem>
              <ListItem href="/docs/primitives/progress" title="Progress">
                Displays an indicator showing the completion progress.
              </ListItem>
              <ListItem href="/docs/primitives/scroll-area" title="Scroll-area">
                Augments native scroll functionality for custom, cross-browser
                styling.
              </ListItem>
              <ListItem href="/docs/primitives/tabs" title="Tabs">
                A set of layered sections of content—known as tab panels.
              </ListItem>
              <ListItem href="/docs/primitives/tooltip" title="Tooltip">
                A popup that displays information related to an element.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Documentation
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithoutViewport: Story = {
  render: (args) => (
    <NavigationMenu {...args} viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-sm leading-none font-medium">Web App</h4>
                <p className="text-muted-foreground text-sm">
                  Build modern web applications with React.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm leading-none font-medium">Mobile App</h4>
                <p className="text-muted-foreground text-sm">
                  Create native mobile experiences.
                </p>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[300px] p-4">
              <div className="space-y-2">
                <h4 className="text-sm leading-none font-medium">Learning</h4>
                <p className="text-muted-foreground text-sm">
                  Tutorials, guides, and best practices.
                </p>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Icons.home className="mr-2 size-4" />
            Home
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-6 md:w-[500px] md:grid-cols-2">
              <ListItem href="/dashboard" title="Dashboard">
                <Icons.activity className="size-4" />
                View your activity and analytics.
              </ListItem>
              <ListItem href="/analytics" title="Analytics">
                <Icons.barChart className="size-4" />
                Detailed insights and reports.
              </ListItem>
              <ListItem href="/settings" title="Settings">
                <Icons.settings className="size-4" />
                Configure your preferences.
              </ListItem>
              <ListItem href="/profile" title="Profile">
                <Icons.user className="size-4" />
                Manage your account information.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Icons.package className="mr-2 size-4" />
            Products
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[600px] gap-3 p-6 md:grid-cols-3">
              <ListItem href="/web" title="Web Platform">
                <Icons.globe className="size-4" />
                Build for the web with modern tools.
              </ListItem>
              <ListItem href="/mobile" title="Mobile SDK">
                <Icons.smartphone className="size-4" />
                Native mobile development kit.
              </ListItem>
              <ListItem href="/api" title="API Services">
                <Icons.server className="size-4" />
                RESTful and GraphQL APIs.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <Icons.book className="mr-2 size-4" />
            Docs
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const SimpleNavigation: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Services
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const WithIndicator: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Features</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
              <ListItem href="/auth" title="Authentication">
                Secure user authentication and authorization.
              </ListItem>
              <ListItem href="/database" title="Database">
                Scalable database solutions.
              </ListItem>
              <ListItem href="/storage" title="Storage">
                File and media storage services.
              </ListItem>
              <ListItem href="/analytics" title="Analytics">
                Real-time analytics and insights.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[400px] p-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Enterprise</h4>
                  <p className="text-muted-foreground text-sm">
                    Complete solutions for large organizations.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Startups</h4>
                  <p className="text-muted-foreground text-sm">
                    Fast and affordable options for growing teams.
                  </p>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
    </NavigationMenu>
  ),
};

export const EcommerceNavigation: Story = {
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Icons.shirt className="mr-2 size-4" />
            Clothing
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[500px] gap-3 p-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-sm leading-none font-medium">Men&apos;s</h4>
                <ListItem href="/mens/tshirts" title="T-Shirts">
                  Comfortable cotton and blend tees.
                </ListItem>
                <ListItem href="/mens/jeans" title="Jeans">
                  Classic and modern denim styles.
                </ListItem>
                <ListItem href="/mens/jackets" title="Jackets">
                  Outerwear for all seasons.
                </ListItem>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm leading-none font-medium">
                  Women&apos;s
                </h4>
                <ListItem href="/womens/dresses" title="Dresses">
                  Elegant and casual dress options.
                </ListItem>
                <ListItem href="/womens/tops" title="Tops">
                  Blouses, tanks, and casual tops.
                </ListItem>
                <ListItem href="/womens/accessories" title="Accessories">
                  Bags, jewelry, and more.
                </ListItem>
              </div>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Icons.shoe className="mr-2 size-4" />
            Shoes
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-6 md:grid-cols-2">
              <ListItem href="/shoes/sneakers" title="Sneakers">
                Athletic and casual sneakers.
              </ListItem>
              <ListItem href="/shoes/boots" title="Boots">
                Work, hiking, and fashion boots.
              </ListItem>
              <ListItem href="/shoes/sandals" title="Sandals">
                Summer comfort and style.
              </ListItem>
              <ListItem href="/shoes/dress" title="Dress Shoes">
                Professional and formal footwear.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <Icons.tag className="mr-2 size-4" />
            Sale
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const Interactive: Story = {
  args: {
    onValueChange: fn(),
  },
  render: (args) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
              <ListItem href="/web" title="Web App">
                Modern web application framework.
              </ListItem>
              <ListItem href="/mobile" title="Mobile App">
                Cross-platform mobile development.
              </ListItem>
              <ListItem href="/desktop" title="Desktop App">
                Native desktop applications.
              </ListItem>
              <ListItem href="/api" title="API Platform">
                RESTful API development tools.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[300px] p-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Consulting</h4>
                  <p className="text-muted-foreground text-sm">
                    Expert guidance for your projects.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Support</h4>
                  <p className="text-muted-foreground text-sm">
                    24/7 technical assistance.
                  </p>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            href="/about"
            onSelect={fn()}
          >
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={navigationMenuTriggerStyle()}
            href="/contact"
            onSelect={fn()}
          >
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(document.body);

    // Test opening Products menu
    const productsButton = canvas.getByRole('button', { name: /Products/ });
    await userEvent.click(productsButton);

    await waitFor(() => {
      expect(screen.getByText('Web App')).toBeVisible();
    });

    // Verify dropdown content
    expect(screen.getByText('Modern web application framework.')).toBeVisible();
    expect(screen.getByText('Mobile App')).toBeVisible();
    expect(screen.getByText('Desktop App')).toBeVisible();
    expect(screen.getByText('API Platform')).toBeVisible();

    // Click on a menu item
    await userEvent.click(screen.getByText('Web App'));

    // Test Services menu
    const servicesButton = canvas.getByRole('button', { name: /Services/ });
    await userEvent.click(servicesButton);

    await waitFor(() => {
      expect(screen.getByText('Consulting')).toBeVisible();
    });

    expect(
      screen.getByText('Expert guidance for your projects.'),
    ).toBeVisible();
    expect(screen.getByText('Support')).toBeVisible();

    // Test direct navigation links
    const aboutLink = canvas.getByRole('link', { name: 'About' });
    await userEvent.click(aboutLink);

    const contactLink = canvas.getByRole('link', { name: 'Contact' });
    await userEvent.click(contactLink);

    // Verify component structure
    const navigationMenu = canvasElement.querySelector(
      '[data-slot="navigation-menu"]',
    );
    expect(navigationMenu).toBeInTheDocument();

    const triggers = canvasElement.querySelectorAll(
      '[data-slot="navigation-menu-trigger"]',
    );
    expect(triggers.length).toBe(2);

    const links = canvasElement.querySelectorAll(
      '[data-slot="navigation-menu-link"]',
    );
    expect(links.length).toBe(2);

    // Test keyboard navigation
    const firstTrigger = canvas.getByRole('button', { name: /Products/ });
    firstTrigger.focus();
    expect(firstTrigger).toHaveFocus();

    // Arrow key navigation
    await userEvent.keyboard('{ArrowRight}');
    const secondTrigger = canvas.getByRole('button', { name: /Services/ });
    expect(secondTrigger).toHaveFocus();
  },
};

// Helper component for consistent list items
const ListItem = ({
  ref,
  className,
  title,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'a'> & {
  title: string;
} & { ref?: React.RefObject<React.ElementRef<'a'> | null> }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none',
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};
ListItem.displayName = 'ListItem';
