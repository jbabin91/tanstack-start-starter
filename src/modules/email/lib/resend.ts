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
  await resend.emails.send({
    from: env.SENDER_EMAIL_ADDRESS,
    react,
    subject,
    text,
    to,
  });
}
