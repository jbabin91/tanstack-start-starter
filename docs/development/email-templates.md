# Email Templates Development Guide

This guide covers creating, testing, and maintaining React Email templates for the TanStack Start blogging platform.

## Quick Start

### Creating a New Template

1. **Create template component** in `src/modules/email/templates/`
2. **Add template exports** to the templates index
3. **Create Storybook story** for visual development
4. **Write unit tests** for rendering and props
5. **Update email API** to use the new template

## Template Architecture

### Template Structure

```typescript
// src/modules/email/templates/organization-invitation.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from './components/email-layout';

interface OrganizationInvitationEmailProps {
  inviterName: string;
  organizationName: string;
  role: 'admin' | 'member' | 'viewer';
  acceptUrl: string;
  expiresAt: Date;
}

export function OrganizationInvitationEmail({
  inviterName = 'John Doe',
  organizationName = 'TanStack Team',
  role = 'member',
  acceptUrl = 'https://example.com/accept',
  expiresAt = new Date('2024-12-31'),
}: OrganizationInvitationEmailProps) {
  const previewText = `${inviterName} invited you to join ${organizationName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <EmailLayout>
          <Container style={container}>
            <Section style={logoSection}>
              <Img
                src="https://your-domain.com/logo.png"
                width="40"
                height="40"
                alt="Logo"
                style={logo}
              />
            </Section>

            <Heading style={heading}>
              You're invited to join {organizationName}
            </Heading>

            <Text style={text}>
              Hi there! {inviterName} has invited you to join{' '}
              <strong>{organizationName}</strong> as a{' '}
              <strong>{role}</strong>.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={acceptUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={subText}>
              This invitation expires on{' '}
              {expiresAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              .
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              If you didn't expect this invitation, you can safely ignore this
              email.
            </Text>
          </Container>
        </EmailLayout>
      </Body>
    </Html>
  );
}

// Default export for React Email compatibility
export default OrganizationInvitationEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoSection = {
  padding: '32px 40px',
};

const logo = {
  margin: '0 auto',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 40px 0',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const buttonSection = {
  padding: '27px 40px 40px',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
};

const subText = {
  ...text,
  fontSize: '14px',
  color: '#666',
};

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 40px 26px',
};

const footer = {
  ...subText,
  fontSize: '12px',
  color: '#898989',
};
```

### Shared Components

Create reusable components for consistent branding:

```typescript
// src/modules/email/templates/components/email-layout.tsx
import { Container, Section } from '@react-email/components';
import type { ReactNode } from 'react';

interface EmailLayoutProps {
  children: ReactNode;
}

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Container style={layoutContainer}>
      {children}
      <Section style={brandingSection}>
        <Text style={brandingText}>
          Sent by <Link href="https://your-domain.com">Your Platform</Link>
        </Text>
      </Section>
    </Container>
  );
}

const layoutContainer = {
  maxWidth: '600px',
  margin: '0 auto',
};

const brandingSection = {
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const brandingText = {
  fontSize: '12px',
  color: '#898989',
};
```

```typescript
// src/modules/email/templates/components/email-button.tsx
import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function EmailButton({
  href,
  children,
  variant = 'primary'
}: EmailButtonProps) {
  const styles = variant === 'primary' ? primaryButton : secondaryButton;

  return (
    <Button style={styles} href={href}>
      {children}
    </Button>
  );
}

const primaryButton = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
};

const secondaryButton = {
  ...primaryButton,
  backgroundColor: 'transparent',
  color: '#5469d4',
  border: '1px solid #5469d4',
};
```

## Development Workflow

### 1. Storybook Development

Create comprehensive Storybook stories for visual development:

```typescript
// src/modules/email/templates/organization-invitation.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { OrganizationInvitationEmail } from './organization-invitation';

const meta: Meta<typeof OrganizationInvitationEmail> = {
  title: 'Email Templates/Organization Invitation',
  component: OrganizationInvitationEmail,
  parameters: {
    docs: {
      description: {
        component: 'Email template for organization member invitations',
      },
    },
  },
  argTypes: {
    role: {
      control: 'select',
      options: ['admin', 'member', 'viewer'],
    },
    expiresAt: {
      control: 'date',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OrganizationInvitationEmail>;

export const Default: Story = {
  args: {
    inviterName: 'Alice Johnson',
    organizationName: 'TanStack Team',
    role: 'member',
    acceptUrl: 'https://example.com/accept-invitation?token=abc123',
    expiresAt: new Date('2024-12-31'),
  },
};

export const AdminRole: Story = {
  args: {
    ...Default.args,
    role: 'admin',
    inviterName: 'Sarah Connor',
    organizationName: 'Skynet Corporation',
  },
};

export const ViewerRole: Story = {
  args: {
    ...Default.args,
    role: 'viewer',
    organizationName: 'Design Agency',
  },
};

export const LongOrganizationName: Story = {
  args: {
    ...Default.args,
    organizationName:
      'The Really Long Organization Name That Tests Text Wrapping',
  },
};

export const ExpiringSoon: Story = {
  args: {
    ...Default.args,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  },
};
```

### 2. Unit Testing

Test template rendering and prop handling:

```typescript
// src/modules/email/templates/__tests__/organization-invitation.test.tsx
import { render } from '@react-email/render';
import { OrganizationInvitationEmail } from '../organization-invitation';

describe('OrganizationInvitationEmail', () => {
  const defaultProps = {
    inviterName: 'Alice Johnson',
    organizationName: 'TanStack Team',
    role: 'member' as const,
    acceptUrl: 'https://example.com/accept',
    expiresAt: new Date('2024-12-31'),
  };

  it('renders with all required props', async () => {
    const html = await render(<OrganizationInvitationEmail {...defaultProps} />);

    expect(html).toContain('Alice Johnson');
    expect(html).toContain('TanStack Team');
    expect(html).toContain('member');
    expect(html).toContain('https://example.com/accept');
    expect(html).toContain('December 31, 2024');
  });

  it('renders different roles correctly', async () => {
    const adminProps = { ...defaultProps, role: 'admin' as const };
    const html = await render(<OrganizationInvitationEmail {...adminProps} />);

    expect(html).toContain('admin');
    expect(html).not.toContain('member');
  });

  it('formats expiration date correctly', async () => {
    const props = {
      ...defaultProps,
      expiresAt: new Date('2024-06-15')
    };
    const html = await render(<OrganizationInvitationEmail {...props} />);

    expect(html).toContain('June 15, 2024');
  });

  it('includes preview text', async () => {
    const html = await render(<OrganizationInvitationEmail {...defaultProps} />);

    expect(html).toContain('Alice Johnson invited you to join TanStack Team');
  });

  it('renders with default props when props are undefined', async () => {
    const html = await render(
      <OrganizationInvitationEmail
        inviterName={undefined as any}
        organizationName={undefined as any}
        role={undefined as any}
        acceptUrl={undefined as any}
        expiresAt={undefined as any}
      />
    );

    // Should not crash and should render defaults
    expect(html).toContain('John Doe');
    expect(html).toContain('TanStack Team');
    expect(html).toContain('member');
  });
});
```

### 3. Email Client Testing

Test across different email clients using Litmus or Email on Acid:

```typescript
// src/modules/email/templates/__tests__/email-client.test.ts
import { render } from '@react-email/render';
import { OrganizationInvitationEmail } from '../organization-invitation';

describe('Email Client Compatibility', () => {
  it('renders without unsupported CSS properties', async () => {
    const html = await render(<OrganizationInvitationEmail {...props} />);

    // Check for email client compatibility
    expect(html).not.toContain('flexbox'); // Not supported in Outlook
    expect(html).not.toContain('grid'); // Limited support
    expect(html).not.toContain('position: absolute'); // Problematic in email

    // Should use table-based layout
    expect(html).toContain('<table');
    expect(html).toContain('cellpadding="0"');
    expect(html).toContain('cellspacing="0"');
  });

  it('includes fallback fonts', async () => {
    const html = await render(<OrganizationInvitationEmail {...props} />);

    expect(html).toContain('font-family');
    expect(html).toContain('sans-serif'); // Fallback font
  });
});
```

## Template Types and Validation

### TypeScript Type Definitions

Create strict TypeScript types for all templates:

```typescript
// src/modules/email/templates/types.ts
export type BaseEmailProps = {
  /** Organization context for multi-tenant emails */
  organizationId?: string;
  /** User ID for tracking and personalization */
  userId?: string;
};

export type AuthenticationEmailProps = BaseEmailProps & {
  userName: string;
  userEmail: string;
};

export type VerificationEmailProps = AuthenticationEmailProps & {
  verificationUrl: string;
  expiresAt: Date;
};

export type PasswordResetEmailProps = AuthenticationEmailProps & {
  resetUrl: string;
  expiresAt: Date;
};

export type OrganizationInvitationEmailProps = BaseEmailProps & {
  inviterName: string;
  organizationName: string;
  role: 'admin' | 'member' | 'viewer';
  acceptUrl: string;
  expiresAt: Date;
};

export type ContentEmailProps = BaseEmailProps & {
  authorName: string;
  postTitle: string;
  postUrl: string;
  organizationName?: string;
};

export type PostPublishedEmailProps = ContentEmailProps & {
  publishedAt: Date;
  excerpt?: string;
};

export type CommentNotificationEmailProps = ContentEmailProps & {
  commenterName: string;
  commentExcerpt: string;
  commentUrl: string;
};
```

### Validation Schemas

Use Arktype for runtime validation:

```typescript
// src/modules/email/templates/schemas.ts
import { type } from 'arktype';

export const VerificationEmailSchema = type({
  userName: 'string',
  userEmail: 'email',
  verificationUrl: 'string',
  expiresAt: 'Date',
  'organizationId?': 'string',
  'userId?': 'string',
});

export const OrganizationInvitationSchema = type({
  inviterName: 'string',
  organizationName: 'string',
  role: "'admin' | 'member' | 'viewer'",
  acceptUrl: 'string',
  expiresAt: 'Date',
  'organizationId?': 'string',
  'userId?': 'string',
});

export const PostPublishedSchema = type({
  authorName: 'string',
  postTitle: 'string',
  postUrl: 'string',
  publishedAt: 'Date',
  'excerpt?': 'string',
  'organizationName?': 'string',
  'organizationId?': 'string',
  'userId?': 'string',
});
```

## Accessibility Best Practices

### Screen Reader Support

```typescript
// Good accessibility practices in email templates
export function AccessibleEmailTemplate() {
  return (
    <Html lang="en">
      <Head>
        <title>Email Title</title>
      </Head>
      <Body>
        {/* Use semantic HTML */}
        <main role="main">
          <Container>
            {/* Descriptive alt text for images */}
            <Img
              src="/logo.png"
              alt="Company Logo"
              width="120"
              height="40"
            />

            {/* Proper heading hierarchy */}
            <Heading as="h1">Main Email Heading</Heading>

            {/* Descriptive link text */}
            <Button href="/action">
              Complete Account Setup
            </Button>

            {/* Don't use "Click here" or "Read more" */}
            <Link href="/article">
              Read full article: "How to Build Better Email Templates"
            </Link>
          </Container>
        </main>
      </Body>
    </Html>
  );
}
```

### Color Contrast

```typescript
// Ensure sufficient color contrast ratios
const colors = {
  // Primary text: 4.5:1 ratio minimum
  primary: '#333333', // Dark gray on white

  // Secondary text: 3:1 ratio minimum for large text
  secondary: '#666666',

  // Button colors with high contrast
  buttonBackground: '#0066cc',
  buttonText: '#ffffff',

  // Link colors that work with text
  link: '#0066cc',
  linkVisited: '#551a8b',
};
```

## Performance Optimization

### Image Optimization

```typescript
// Optimize images for email
export function OptimizedEmailImages() {
  return (
    <Container>
      {/* Use appropriate image formats */}
      <Img
        src="/logo.png" // PNG for logos with transparency
        alt="Company Logo"
        width="120"
        height="40"
        style={{ display: 'block' }} // Prevent gaps in Outlook
      />

      {/* Provide fallback for images */}
      <Img
        src="/hero-image.jpg"
        alt="Featured content preview"
        width="600"
        height="300"
        style={{
          backgroundColor: '#f0f0f0', // Fallback color
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
        }}
      />

      {/* Use CDN for better performance */}
      <Img
        src="https://cdn.yourdomain.com/images/feature-icon.png"
        alt="Feature icon"
        width="24"
        height="24"
      />
    </Container>
  );
}
```

### CSS Optimization

```typescript
// Inline styles for better email client support
const optimizedStyles = {
  // Avoid shorthand properties
  container: {
    paddingTop: '20px',
    paddingBottom: '20px',
    paddingLeft: '40px',
    paddingRight: '40px',
    // Instead of: padding: '20px 40px'
  },

  // Use explicit values
  text: {
    fontSize: '16px', // Not 'medium' or '1rem'
    lineHeight: '24px', // Not '1.5'
    color: '#333333', // Not 'dark-gray'
  },

  // Table-based layouts for Outlook
  tableCell: {
    verticalAlign: 'top',
    textAlign: 'left' as const,
  },
};
```

## Template Management

### Template Registry

Create a centralized template registry:

```typescript
// src/modules/email/templates/registry.ts
import type { ComponentType } from 'react';
import { VerificationEmail } from './verification-email';
import { PasswordResetEmail } from './password-reset-email';
import { OrganizationInvitationEmail } from './organization-invitation-email';
import { PostPublishedEmail } from './post-published-email';

export type EmailTemplate = {
  name: string;
  component: ComponentType<any>;
  description: string;
  category: 'authentication' | 'organization' | 'content' | 'system';
  requiredProps: string[];
};

export const emailTemplates: Record<string, EmailTemplate> = {
  'verification-email': {
    name: 'Email Verification',
    component: VerificationEmail,
    description: 'Sent when users need to verify their email address',
    category: 'authentication',
    requiredProps: ['userName', 'verificationUrl', 'expiresAt'],
  },

  'password-reset': {
    name: 'Password Reset',
    component: PasswordResetEmail,
    description: 'Sent when users request a password reset',
    category: 'authentication',
    requiredProps: ['userName', 'resetUrl', 'expiresAt'],
  },

  'organization-invitation': {
    name: 'Organization Invitation',
    component: OrganizationInvitationEmail,
    description: 'Sent when users are invited to join an organization',
    category: 'organization',
    requiredProps: ['inviterName', 'organizationName', 'role', 'acceptUrl'],
  },

  'post-published': {
    name: 'Post Published',
    component: PostPublishedEmail,
    description: 'Sent when a new post is published',
    category: 'content',
    requiredProps: ['authorName', 'postTitle', 'postUrl', 'publishedAt'],
  },
};

export function getTemplate(templateName: string): EmailTemplate | null {
  return emailTemplates[templateName] || null;
}

export function getTemplatesByCategory(
  category: EmailTemplate['category'],
): EmailTemplate[] {
  return Object.values(emailTemplates).filter(
    (template) => template.category === category,
  );
}
```

### Template Versioning

Handle template updates gracefully:

```typescript
// src/modules/email/templates/versioning.ts
export type TemplateVersion = {
  version: string;
  component: ComponentType<any>;
  deprecated?: boolean;
  migrationGuide?: string;
};

export const templateVersions: Record<string, TemplateVersion[]> = {
  'verification-email': [
    {
      version: '1.0.0',
      component: VerificationEmailV1,
      deprecated: true,
      migrationGuide:
        'Update to v2.0.0 for improved accessibility and mobile support',
    },
    {
      version: '2.0.0',
      component: VerificationEmail,
    },
  ],
};

export function getTemplateVersion(
  templateName: string,
  version: string = 'latest',
): ComponentType<any> | null {
  const versions = templateVersions[templateName];
  if (!versions) return null;

  if (version === 'latest') {
    return versions[versions.length - 1].component;
  }

  const specificVersion = versions.find((v) => v.version === version);
  return specificVersion?.component || null;
}
```

## Integration with Email API

### Template Rendering

```typescript
// src/modules/email/lib/template-renderer.ts
import { render } from '@react-email/render';
import { getTemplate } from '../templates/registry';
import type { EmailTemplateProps } from '../types';

export async function renderEmailTemplate(
  templateName: string,
  props: EmailTemplateProps,
): Promise<{ html: string; text: string }> {
  const template = getTemplate(templateName);

  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  // Validate required props
  const missingProps = template.requiredProps.filter(
    (prop) => !(prop in props),
  );

  if (missingProps.length > 0) {
    throw new Error(
      `Missing required props for template "${templateName}": ${missingProps.join(', ')}`,
    );
  }

  // Render HTML version
  const html = await render(React.createElement(template.component, props));

  // Generate plain text version
  const text = await render(React.createElement(template.component, props), {
    plainText: true,
  });

  return { html, text };
}
```

### Template Testing in Development

```typescript
// src/modules/email/dev/template-preview.ts
import { renderEmailTemplate } from '../lib/template-renderer';

export async function previewTemplate(
  templateName: string,
  props: Record<string, any>,
) {
  try {
    const { html, text } = await renderEmailTemplate(templateName, props);

    // In development, save to files for preview
    if (process.env.NODE_ENV === 'development') {
      await writeFile(`./dev-emails/${templateName}.html`, html);
      await writeFile(`./dev-emails/${templateName}.txt`, text);
    }

    return { html, text, success: true };
  } catch (error) {
    return {
      error: error.message,
      success: false,
    };
  }
}
```

## Troubleshooting

### Common Issues

1. **Images not displaying**
   - Use absolute URLs for all images
   - Provide alt text for all images
   - Set explicit width and height
   - Use `display: block` to prevent gaps

2. **Layout breaking in Outlook**
   - Use table-based layouts
   - Avoid flexbox and grid
   - Set explicit cellpadding and cellspacing
   - Use inline styles instead of CSS classes

3. **Text rendering issues**
   - Provide font fallbacks
   - Use web-safe fonts
   - Set explicit line-height values
   - Avoid custom fonts unless necessary

4. **Mobile responsiveness**
   - Use fluid tables instead of fixed widths
   - Test on actual mobile email clients
   - Use media queries sparingly
   - Keep subject lines under 40 characters

### Debug Tools

```typescript
// src/modules/email/dev/debug-tools.ts
export function debugEmailHTML(html: string): void {
  console.log('Email HTML Debug Info:');
  console.log('Character count:', html.length);
  console.log('Image count:', (html.match(/<img/gi) || []).length);
  console.log('Link count:', (html.match(/<a/gi) || []).length);
  console.log('Table count:', (html.match(/<table/gi) || []).length);

  // Check for common issues
  const issues = [];

  if (html.includes('position: absolute')) {
    issues.push('Contains absolute positioning (problematic in email)');
  }

  if (html.includes('flexbox') || html.includes('display: flex')) {
    issues.push('Contains flexbox (not supported in Outlook)');
  }

  if (!html.includes('font-family')) {
    issues.push('No font-family specified');
  }

  if (issues.length > 0) {
    console.warn('Potential issues found:');
    issues.forEach((issue) => console.warn(`- ${issue}`));
  }
}
```

For more information on email system implementation, see:

- [Email API Documentation](../api/email.md)
- [Component Patterns](./component-patterns.md)
- [Testing Guidelines](./storybook-testing.md)
