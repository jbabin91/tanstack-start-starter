import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { render } from '@react-email/render';

type VerificationEmailProps = {
  user: {
    name?: string | null;
    email: string;
  };
  verificationUrl: string;
};

export function VerificationEmail({
  user,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for TanStack Start</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-12 font-sans">
          <Container className="mx-auto max-w-[600px]">
            {/* Card */}
            <Section className="overflow-hidden rounded-lg bg-white shadow-md">
              {/* Logo */}
              <Section className="border-b border-gray-200 p-6 text-center">
                <img
                  alt="TanStack"
                  className="mx-auto"
                  height={40}
                  src="https://raw.githubusercontent.com/TanStack/tanstack/main/assets/tanstack-banner.svg"
                  width={150}
                />
              </Section>

              {/* Content */}
              <Section className="px-6 py-8">
                <Heading className="mb-6 text-center text-2xl font-semibold text-gray-900">
                  Welcome to TanStack Start!
                </Heading>
                <Text className="mb-6 text-base text-gray-700">
                  Hi {user.name ?? 'there'},
                </Text>
                <Text className="mb-6 text-base text-gray-700">
                  Thanks for signing up! Please verify your email address by
                  clicking the button below.
                </Text>

                {/* Action Button */}
                <Section className="my-8 text-center">
                  <Button
                    className="inline-block rounded-lg bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-900"
                    href={verificationUrl}
                  >
                    Verify Email Address
                  </Button>
                </Section>

                {/* Alternative Link */}
                <Text className="mb-6 text-sm text-gray-500">
                  Or copy and paste this URL into your browser:{' '}
                  <Link
                    className="text-blue-600 underline"
                    href={verificationUrl}
                  >
                    {verificationUrl}
                  </Link>
                </Text>

                <Hr className="my-8 w-full border-gray-200" />

                {/* Footer */}
                <Text className="text-center text-sm text-gray-500">
                  If you didn&apos;t sign up for TanStack Start, you can safely
                  ignore this email.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export async function renderVerificationEmail(props: VerificationEmailProps) {
  const component = <VerificationEmail {...props} />;
  return {
    react: component,
    text: await render(component, { plainText: true }),
  };
}
