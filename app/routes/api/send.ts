import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';

import { EmailTemplate } from '~/components/email/email-template';
import { resend } from '~/lib/server/resend';

export const APIRoute = createAPIFileRoute('/api/send')({
  GET: async () => {
    const { data, error } = await resend.emails.send({
      from: 'TanStarter <onboarding@jacebabin.com>',
      react: EmailTemplate({ firstName: 'Jace' }),
      subject: 'Hello from TanStack Start',
      to: 'jbabin91@gmail.com',
    });

    if (error) {
      return json({ error }, { status: 500 });
    }

    return json(data);
  },
});
