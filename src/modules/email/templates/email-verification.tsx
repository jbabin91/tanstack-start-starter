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

export type EmailVerificationProps = {
  url: string;
  userName: string;
};

export function EmailVerification({ url, userName }: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Verify your email address to complete your TanStack Start registration
      </Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: '#0070f3',
                'brand-light': '#f0f8ff',
                'gray-100': '#f3f4f6',
                'gray-50': '#f9fafb',
                'gray-600': '#4b5563',
                'gray-900': '#111827',
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
                  Welcome{userName ? `, ${userName}` : ''}!
                </Heading>

                <Text className="mb-6 text-base leading-6 text-gray-600">
                  Thanks for signing up! To complete your registration and start
                  using your account, please verify your email address by
                  clicking the button below.
                </Text>

                {/* CTA Button */}
                <Section className="mb-6 text-center">
                  <Button
                    className="bg-brand inline-block rounded-md px-8 py-3 text-base font-medium text-white no-underline"
                    href={url}
                  >
                    Verify Email Address
                  </Button>
                </Section>

                <Text className="mb-2 text-sm leading-5 text-gray-600">
                  If the button doesn&apos;t work, you can copy and paste this
                  link into your browser:
                </Text>

                <Text className="rounded-sm border border-gray-200 bg-gray-100 px-3 py-2 text-sm break-all text-gray-600">
                  {url}
                </Text>

                <Text className="mt-6 text-sm leading-5 text-gray-600">
                  This verification link will expire in 24 hours for security
                  reasons.
                </Text>
              </Section>

              {/* Footer */}
              <Section className="rounded-b-lg border-t border-gray-200 bg-gray-100 p-6 text-center">
                <Text className="mb-2 text-sm text-gray-600">
                  If you didn&apos;t create an account, you can safely ignore
                  this email.
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

export async function sendEmailVerification({
  to,
  url,
  userName,
}: {
  to: string;
  url: string;
  userName: string;
}) {
  const emailComponent = <EmailVerification url={url} userName={userName} />;
  const text = await render(emailComponent, { plainText: true });

  await sendEmail({
    react: emailComponent,
    subject: 'Welcome! Verify your email address - TanStack Start',
    text,
    to,
  });
}
