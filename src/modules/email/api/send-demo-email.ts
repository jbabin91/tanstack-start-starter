import { createServerFn } from '@tanstack/react-start';
import { type } from 'arktype';

import { formDemoSchema } from '@/modules/email/components/email-demo-form';
import { sendDemoEmail } from '@/modules/email/templates/demo-email';

export const sendDemoEmailFn = createServerFn()
  .inputValidator((data: unknown) => {
    const result = formDemoSchema(data);
    if (result instanceof type.errors) throw new Error(result.summary);
    return result;
  })
  .handler(async (ctx) => {
    await sendDemoEmail({ to: ctx.data.email });
  });
