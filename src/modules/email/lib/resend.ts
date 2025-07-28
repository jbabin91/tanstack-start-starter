import { Resend } from 'resend';

import { env } from '@/configs/env';

export const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  text,
  react,
}: {
  to: string;
  subject: string;
  text?: string;
  react?: React.ReactElement;
}) {
  const result = await resend.emails.send({
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

  if (result.error) {
    console.error('Failed to send email:', result.error);
    throw new Error(`Failed to send email: ${result.error.message}`);
  }

  return result;
}
