import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

const meta = {
  title: 'UI/Surfaces/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An accordion component for organizing content into collapsible sections. Follows WCAG AA accessibility standards with proper ARIA attributes and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      description: 'The accordion behavior type',
      control: 'select',
      options: ['single', 'multiple'],
      table: {
        type: { summary: '"single" | "multiple"' },
        defaultValue: { summary: 'single' },
      },
    },
    collapsible: {
      description:
        'When type is "single", allows closing all items (only applies to single type)',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    defaultValue: {
      description: 'The default expanded item(s)',
      control: 'text',
      table: {
        type: { summary: 'string | string[]' },
      },
    },
    disabled: {
      description: 'Whether the accordion is disabled',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default single accordion
export const Default: Story = {
  args: {
    type: 'single',
    collapsible: true,
    className: 'w-[450px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern and includes proper
          keyboard navigation support.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other
          components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Multiple items can be expanded
export const Multiple: Story = {
  args: {
    type: 'multiple',
    defaultValue: ['item-1', 'item-3'],
    className: 'w-[450px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Multiple Selection Mode</AccordionTrigger>
        <AccordionContent>
          In multiple mode, several items can be expanded at the same time. This
          is useful when users need to compare content across sections.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Default Expanded Items</AccordionTrigger>
        <AccordionContent>
          You can set default expanded items using the defaultValue prop with an
          array of item values.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Keyboard Navigation</AccordionTrigger>
        <AccordionContent>
          Use Arrow Up/Down to navigate between triggers, Enter or Space to
          toggle expansion, and Home/End to jump to first/last item.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Single mode with collapsible disabled
export const AlwaysOpen: Story = {
  args: {
    type: 'single',
    collapsible: false,
    defaultValue: 'item-1',
    className: 'w-[450px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Always One Open</AccordionTrigger>
        <AccordionContent>
          When collapsible is false in single mode, at least one item must
          always remain open. Try clicking on this item - it won&apos;t close!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Switching Sections</AccordionTrigger>
        <AccordionContent>
          Clicking another section will open it and automatically close the
          previously open section.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Use Cases</AccordionTrigger>
        <AccordionContent>
          This pattern is useful for step-by-step processes or when you want to
          ensure users always have some content visible.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// FAQ Example
export const FAQ: Story = {
  args: {
    type: 'single',
    collapsible: true,
    className: 'w-[500px]',
  },
  render: (args) => (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Frequently Asked Questions</h2>
      <Accordion {...args}>
        <AccordionItem value="pricing">
          <AccordionTrigger>What are your pricing plans?</AccordionTrigger>
          <AccordionContent>
            We offer flexible pricing plans to suit businesses of all sizes. Our
            starter plan begins at $9/month, with professional and enterprise
            options available. All plans include a 14-day free trial.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="security">
          <AccordionTrigger>How secure is my data?</AccordionTrigger>
          <AccordionContent>
            Your data security is our top priority. We use industry-standard
            encryption, regular security audits, and comply with GDPR, CCPA, and
            SOC 2 Type II standards. All data is encrypted both in transit and
            at rest.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="support">
          <AccordionTrigger>
            What kind of support do you offer?
          </AccordionTrigger>
          <AccordionContent>
            We provide 24/7 customer support through multiple channels including
            live chat, email, and phone. Premium plans also include dedicated
            account managers and priority support with guaranteed response
            times.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="integration">
          <AccordionTrigger>Can I integrate with other tools?</AccordionTrigger>
          <AccordionContent>
            Yes! We offer integrations with over 100 popular tools including
            Slack, Microsoft Teams, Salesforce, and more. We also provide a
            robust API and webhooks for custom integrations.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="cancel">
          <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
          <AccordionContent>
            Absolutely. We believe in earning your business every month. You can
            cancel your subscription at any time with no cancellation fees. Your
            service will continue until the end of your billing period.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

// With Long Content
export const LongContent: Story = {
  args: {
    type: 'single',
    collapsible: true,
    className: 'w-[600px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Terms of Service</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of our
              website and services. By accessing or using our services, you
              agree to be bound by these Terms.
            </p>
            <h4 className="font-semibold">1. Acceptance of Terms</h4>
            <p>
              By accessing and using this service, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to abide by the above, please do not use this service.
            </p>
            <h4 className="font-semibold">2. Use License</h4>
            <p>
              Permission is granted to temporarily download one copy of the
              materials for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title.
            </p>
            <h4 className="font-semibold">3. Disclaimer</h4>
            <p>
              The materials on our website are provided on an &apos;as is&apos;
              basis. We make no warranties, expressed or implied, and hereby
              disclaim and negate all other warranties including, without
              limitation, implied warranties or conditions of merchantability,
              fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Privacy Policy</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <p>
              Your privacy is important to us. This privacy policy explains what
              personal data we collect and how we use it.
            </p>
            <h4 className="font-semibold">Information We Collect</h4>
            <p>
              We collect information you provide directly to us, such as when
              you create an account, subscribe to our newsletter, or contact us.
            </p>
            <h4 className="font-semibold">How We Use Your Information</h4>
            <p>
              We use the information we collect to provide, maintain, and
              improve our services, send you technical notices and support
              messages, and respond to your comments and questions.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Interactive Test
export const Interactive: Story = {
  args: {
    type: 'single',
    collapsible: true,
    className: 'w-[450px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Click me to expand</AccordionTrigger>
        <AccordionContent>
          Great! You&apos;ve expanded the first item. Try clicking it again to
          collapse.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Now try this one</AccordionTrigger>
        <AccordionContent>
          Perfect! Notice how the previous item collapsed automatically in
          single mode.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Keyboard navigation works too</AccordionTrigger>
        <AccordionContent>
          Try using Arrow keys to navigate and Space or Enter to toggle items!
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Expand first item', async () => {
      const firstTrigger = canvas.getByText('Click me to expand');
      await userEvent.click(firstTrigger);

      const content = canvas.getByText(/Great! You've expanded/);
      await expect(content).toBeVisible();
    });

    await step('Expand second item (first should collapse)', async () => {
      const secondTrigger = canvas.getByText('Now try this one');
      await userEvent.click(secondTrigger);

      const secondContent = canvas.getByText(/Perfect! Notice how/);
      await expect(secondContent).toBeVisible();

      // Wait for collapse animation to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // First content should no longer be visible after animation
      const firstContent = canvas.queryByText(/Great! You've expanded/);
      if (firstContent) {
        await expect(firstContent).not.toBeVisible();
      } else {
        // Content has been removed from DOM entirely, which is also valid
        expect(firstContent).toBeNull();
      }
    });

    await step('Collapse second item', async () => {
      const secondTrigger = canvas.getByText('Now try this one');
      await userEvent.click(secondTrigger);

      // Wait for collapse animation to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Second content should no longer be visible after animation
      const secondContent = canvas.queryByText(/Perfect! Notice how/);
      if (secondContent) {
        await expect(secondContent).not.toBeVisible();
      } else {
        // Content has been removed from DOM entirely, which is also valid
        expect(secondContent).toBeNull();
      }
    });
  },
};

// Nested Accordions
export const Nested: Story = {
  args: {
    type: 'single',
    collapsible: true,
    className: 'w-[500px]',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Product Categories</AccordionTrigger>
        <AccordionContent>
          <Accordion collapsible className="ml-4" type="single">
            <AccordionItem value="electronics">
              <AccordionTrigger>Electronics</AccordionTrigger>
              <AccordionContent>
                Computers, phones, tablets, and accessories
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="clothing">
              <AccordionTrigger>Clothing</AccordionTrigger>
              <AccordionContent>
                Men&apos;s, women&apos;s, and children&apos;s apparel
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="home">
              <AccordionTrigger>Home & Garden</AccordionTrigger>
              <AccordionContent>
                Furniture, decor, and gardening supplies
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Customer Service</AccordionTrigger>
        <AccordionContent>
          Contact us via email, phone, or live chat for assistance with your
          orders and questions.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// With Custom Styling
export const CustomStyling: Story = {
  args: {
    type: 'single',
    collapsible: true,
    className: 'w-[500px] rounded-lg border-2 border-primary bg-primary/5 p-2',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem className="border-primary/20" value="item-1">
        <AccordionTrigger className="text-primary hover:text-primary/80">
          Custom Styled Accordion
        </AccordionTrigger>
        <AccordionContent>
          This accordion has custom styling applied through className props. The
          container has a primary color border and background.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem className="border-primary/20" value="item-2">
        <AccordionTrigger className="text-primary hover:text-primary/80">
          Flexible Theming
        </AccordionTrigger>
        <AccordionContent>
          You can customize the appearance using Tailwind CSS classes on any
          part of the accordion component.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem className="border-primary/20" value="item-3">
        <AccordionTrigger className="text-primary hover:text-primary/80">
          Maintains Accessibility
        </AccordionTrigger>
        <AccordionContent>
          Even with custom styling, all accessibility features remain intact
          including keyboard navigation and ARIA attributes.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
