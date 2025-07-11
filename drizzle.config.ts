import { defineConfig } from 'drizzle-kit';

import { env } from './src/configs/env';

export default defineConfig({
  casing: 'snake_case',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: 'postgresql',
  out: './src/lib/db/migrations',
  schema: './src/lib/db/schemas',
});
