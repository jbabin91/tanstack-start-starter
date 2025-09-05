import {
  Body,
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

export type OTPVerificationProps = {
  otp: string;
  userName?: string;
};

export function OTPVerification({ otp, userName }: OTPVerificationProps) {
  return (
    <Html>
      <Head>
        <style>
          {`
            .otp-code {
              user-select: all !important;
              -webkit-user-select: all !important;
              -moz-user-select: all !important;
              -ms-user-select: all !important;
              cursor: text !important;
            }
            .otp-code:hover {
              background-color: #dbeafe !important;
            }
            .selectable-text {
              user-select: text !important;
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
            }
          `}
        </style>
      </Head>
      <Preview>
        Your sign-in code is {otp} - Your sign-in code - TanStack Start
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
                  {userName ? `Hi ${userName},` : 'Sign in to your account'}
                </Heading>

                <Text className="mb-6 text-base leading-6 text-gray-600">
                  Enter this code to sign in to your TanStack Start account.
                </Text>

                {/* OTP Code */}
                <Section className="mb-6 text-center">
                  {/* Enhanced OTP Display */}
                  <div className="border-brand bg-brand-light inline-block rounded-lg border-2 border-dashed px-8 py-6">
                    <Text className="otp-code m-0 font-mono text-4xl font-bold tracking-widest text-gray-900 select-all">
                      {otp}
                    </Text>
                  </div>

                  {/* Copy Instructions with Enhanced UX */}
                  <Section className="mt-4">
                    <Text className="mb-2 text-sm font-medium text-gray-700">
                      📋 Tap and hold the code above to copy it
                    </Text>
                    <Text className="text-xs text-gray-500">
                      On desktop: Triple-click to select all • On mobile: Tap
                      and hold to copy
                    </Text>
                  </Section>

                  {/* Additional Help */}
                  <Section className="mt-3 rounded-md bg-gray-50 p-3">
                    <Text className="m-0 text-xs text-gray-600">
                      💡 <strong>Tip:</strong> The code is designed to be easily
                      selectable. Use your device&apos;s copy function after
                      selecting the numbers above.
                    </Text>
                  </Section>
                </Section>

                <Text className="mb-4 text-sm leading-5 text-gray-600">
                  This code will expire in 5 minutes for security reasons.
                </Text>

                <Text className="text-sm leading-5 text-gray-600">
                  If you didn&apos;t request this code, you can safely ignore
                  this email.
                </Text>
              </Section>

              {/* Footer */}
              <Section className="rounded-b-lg border-t border-gray-200 bg-gray-100 p-6 text-center">
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

export async function sendOTPVerification({
  to,
  otp,
  userName,
}: {
  to: string;
  otp: string;
  userName?: string;
}) {
  const emailComponent = <OTPVerification otp={otp} userName={userName} />;
  const text = await render(emailComponent, { plainText: true });

  await sendEmail({
    react: emailComponent,
    subject: 'Your sign-in code - TanStack Start',
    text,
    to,
  });
}
