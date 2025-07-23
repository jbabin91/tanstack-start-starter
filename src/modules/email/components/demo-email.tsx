import {
  Button,
  pixelBasedPreset,
  render,
  Tailwind,
} from '@react-email/components';

import { sendEmail } from '@/modules/email/lib/resend';

export function DemoEmail() {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: '#007291',
            },
          },
        },
      }}
    >
      <head>
        <title>Demo Email</title>
      </head>
      <body>
        <h1 className="text-5xl font-semibold">Hello, World!</h1>
        <Button
          className="bg-brand px-3 py-2 leading-4 font-medium text-white"
          onClick={() => alert('Button clicked!')}
        >
          Click me!
        </Button>
      </body>
    </Tailwind>
  );
}

export async function sendDemoEmail({ to }: { to: string }) {
  const emailComponent = <DemoEmail />;
  const text = await render(emailComponent, { plainText: true });

  await sendEmail({
    react: emailComponent,
    subject: 'hello world',
    text,
    to,
  });
}
