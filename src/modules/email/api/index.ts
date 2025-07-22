import { createServerFn } from '@tanstack/react-start';
import { type } from 'arktype';

import { sendDemoEmail } from '@/modules/email/components/demo-email';
import { formDemoSchema } from '@/modules/email/components/demo-email-form';

export const sendDemoEmailFn = createServerFn()
  .validator((data: unknown) => {
    const result = formDemoSchema(data);
    if (result instanceof type.errors) throw new Error(result.summary);
    return result;
  })
  .handler(async (ctx) => {
    await sendDemoEmail({ to: ctx.data.email });
  });
