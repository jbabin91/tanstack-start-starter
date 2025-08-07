import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  pixelBasedPreset,
  Preview,
  render,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

import { sendEmail } from '@/modules/email/lib/resend';

export type PasswordResetProps = {
  url: string;
  userName: string;
};

export function PasswordReset({ url, userName }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your TanStack Start password - secure link inside</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: '#dc2626',
                'brand-dark': '#b91c1c',
                'gray-100': '#f3f4f6',
                'gray-50': '#f9fafb',
                'gray-600': '#4b5563',
                'gray-900': '#111827',
                'yellow-200': '#fde68a',
                'yellow-50': '#fffbeb',
                'yellow-800': '#92400e',
              },
            },
          },
        }}
      >
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto px-4 py-20">
            <Section className="mx-auto max-w-lg rounded-lg bg-white shadow-sm">
              {/* Header */}
              <Section className="bg-brand rounded-t-lg px-6 py-8 text-center">
                <Heading className="m-0 text-2xl font-semibold text-white">
                  TanStack Start
                </Heading>
              </Section>

              {/* Content */}
              <Section className="px-6 py-8">
                <Heading className="mb-4 text-xl font-semibold text-gray-900">
                  Reset your password
                </Heading>

                <Text className="mb-4 text-base leading-6 text-gray-600">
                  Hi{userName ? ` ${userName}` : ''},
                </Text>

                <Text className="mb-6 text-base leading-6 text-gray-600">
                  We received a request to reset your password. If you made this
                  request, click the button below to create a new password:
                </Text>

                {/* CTA Button */}
                <Section className="mb-6 text-center">
                  <Button
                    className="bg-brand inline-block rounded-md px-8 py-3 text-base font-medium text-white no-underline"
                    href={url}
                  >
                    Reset Password
                  </Button>
                </Section>

                <Text className="mb-2 text-sm leading-5 text-gray-600">
                  If the button doesn&apos;t work, you can copy and paste this
                  link into your browser:
                </Text>

                <Text className="rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm break-all text-gray-600">
                  {url}
                </Text>

                <Text className="mt-6 text-sm leading-5 text-gray-600">
                  This password reset link will expire in 1 hour for security
                  reasons.
                </Text>

                {/* Security Warning */}
                <Section className="border-warning/20 bg-warning/10 mt-6 rounded-md border p-4">
                  <Text className="text-warning-foreground mb-2 text-sm font-semibold">
                    🔒 Security Notice
                  </Text>
                  <Text className="text-warning-foreground m-0 text-sm leading-5">
                    If you didn&apos;t request a password reset, someone else
                    might be trying to access your account. Please check your
                    account security and consider changing your password.
                  </Text>
                </Section>
              </Section>

              {/* Footer */}
              <Section className="rounded-b-lg border-t border-gray-200 bg-gray-100 px-6 py-6 text-center">
                <Text className="mb-2 text-sm text-gray-600">
                  If you didn&apos;t request a password reset, you can safely
                  ignore this email.
                </Text>

                <Text className="m-0 text-xs text-gray-600">
                  © {new Date().getFullYear()} TanStack Start. All rights
                  reserved.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export async function sendPasswordReset({
  to,
  url,
  userName,
}: {
  to: string;
  url: string;
  userName: string;
}) {
  const emailComponent = <PasswordReset url={url} userName={userName} />;
  const text = await render(emailComponent, { plainText: true });

  await sendEmail({
    react: emailComponent,
    subject: 'Reset your password - TanStack Start',
    text,
    to,
  });
}
