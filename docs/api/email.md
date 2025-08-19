# Email API Documentation

This document covers the email system implementation using Resend for transactional emails in the TanStack Start blogging platform.

## Overview

The email system provides:

- **React Email Templates** - Responsive, branded email templates using @react-email/components
- **Resend Integration** - Direct email delivery via Resend API
- **Better-auth Integration** - Seamless integration with authentication flows
- **Template-based Approach** - Reusable email templates for different use cases

## Current Implementation

The current email system is streamlined and focused on core functionality. It uses:

- **Direct Resend API calls** - No queue system, immediate delivery
- **React Email templates** - Built with @react-email/components
- **Better-auth integration** - Automatic email sending for auth flows
- **Simple error handling** - Straightforward error management

## Email Templates

### Available Templates

The current implementation includes templates for authentication flows:

#### User Authentication (Implemented)

- **Email Verification** - `EmailVerificationTemplate`
- **Password Reset** - `PasswordResetTemplate`

### Template Usage

Email templates are integrated with better-auth and called automatically during authentication flows:

```typescript
// Email verification - automatically sent by better-auth
// src/lib/auth/server.ts
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    await sendEmailVerification({
      to: user.email,
      url,
      userName: user.name,
    });
  },
}

// Password reset - automatically sent by better-auth
emailAndPassword: {
  sendResetPassword: async ({ user, url }) => {
    await sendPasswordReset({
      to: user.email,
      url,
      userName: user.name,
    });
  },
}
```

## Core Email Function

### `sendEmail`

The core email sending function provides direct Resend integration:

```typescript
// src/modules/email/lib/resend.ts
import { Resend } from 'resend';
import { type } from 'arktype';
import { env } from '@/configs/env';

// Reusable schema - can be used in forms and server functions
export const SendEmailInputSchema = type({
  to: 'string.email',
  subject: 'string >= 1',
  'text?': 'string',
  'react?': 'unknown', // React.ReactElement can't be validated by Arktype
});

export const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(input: {
  to: string;
  subject: string;
  text?: string;
  react?: React.ReactElement;
}) {
  // Validate input
  const result = SendEmailInputSchema(input);
  if (result instanceof type.errors) {
    throw new Error(`Invalid email input: ${result.summary}`);
  }

  const { to, subject, text, react } = input;
  const emailResult = await resend.emails.send({
    from: env.SENDER_EMAIL_ADDRESS,
    // Add headers for better deliverability
    headers: {
      'X-Entity-Ref-ID': Date.now().toString(),
    },
    react,
    subject,
    // Add tags for tracking
    tags: [
      {
        name: 'category',
        value: 'transactional',
      },
    ],
    text,
    to,
  });

  if (emailResult.error) {
    console.error('Failed to send email:', emailResult.error);
    throw new Error(`Failed to send email: ${emailResult.error.message}`);
  }

  return emailResult;
}
```

## Template Functions

### Email Verification

Email verification is handled automatically by better-auth:

```typescript
import { type } from 'arktype';

export const SendEmailVerificationInputSchema = type({
  to: 'string.email',
  url: 'string',
  userName: 'string',
});

// src/modules/email/templates/email-verification.ts
export async function sendEmailVerification(input: {
  to: string;
  url: string;
  userName: string;
}) {
  // Validate input
  const result = SendEmailVerificationInputSchema(input);
  if (result instanceof type.errors) {
    throw new Error(`Invalid email verification input: ${result.summary}`);
  }

  const { to, url, userName } = input;
  await sendEmail({
    to,
    subject: 'Verify your email address',
    react: EmailVerificationTemplate({ userName, url }),
  });
}
```

### Password Reset

Password reset emails are also handled by better-auth:

```typescript
import { type } from 'arktype';

export const SendPasswordResetInputSchema = type({
  to: 'string.email',
  url: 'string',
  userName: 'string',
});

// src/modules/email/templates/password-reset.ts
export async function sendPasswordReset(input: {
  to: string;
  url: string;
  userName: string;
}) {
  // Validate input
  const result = SendPasswordResetInputSchema(input);
  if (result instanceof type.errors) {
    throw new Error(`Invalid password reset input: ${result.summary}`);
  }

  const { to, url, userName } = input;
  await sendEmail({
    to,
    subject: 'Reset your password',
    react: PasswordResetTemplate({ userName, url }),
  });
}
```

## Environment Configuration

### Required Environment Variables

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx
SENDER_EMAIL_ADDRESS="TanStack Starter <noreply@yourdomain.com>"
```

## Integration with Better-Auth

The email system is tightly integrated with better-auth for seamless authentication flows:

1. **Email verification** - Automatically sent when users sign up
2. **Password reset** - Triggered through better-auth password reset flow
3. **Template consistency** - All emails use React Email components
4. **Error handling** - Integrated with better-auth error management

For more information on authentication setup, see:

- [Authentication API](./auth.md) - Better-auth configuration
- [Sessions API](./sessions.md) - Session management
- [Development Guide](../development/index.md) - Implementation patterns
