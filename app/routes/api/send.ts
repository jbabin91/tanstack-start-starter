import { render } from '@react-email/render';
import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';

import { EmailTemplate } from '~/features/email/components/email-template';
import { resend } from '~/lib/server/resend';

export const APIRoute = createAPIFileRoute('/api/send')({
  GET: async () => {
    const email = EmailTemplate({ firstName: 'Jace' });

    const plainText = await render(email, {
      plainText: true,
    });

    const { data, error } = await resend.emails.send({
      from: 'TanStarter <onboarding@starter.jacebabin.com>',
      react: email,
      subject: 'Hello from TanStack Start',
      text: plainText,
      to: 'jbabin91@gmail.com',
    });

    if (error) {
      return json({ error }, { status: 500 });
    }

    return json(data);
  },
});
