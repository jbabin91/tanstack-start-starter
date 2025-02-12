import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  breakpoints: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: 'postgresql',
  out: './.drizzle',
  schema: './app/lib/server/schema/index.ts',
  strict: true,
  verbose: true,
});
