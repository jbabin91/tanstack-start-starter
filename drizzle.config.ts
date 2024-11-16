import { defineConfig } from 'drizzle-kit';

const base = './app/db';

export default defineConfig({
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: 'postgresql',
  out: `${base}/migrations`,
  schema: `${base}/schema`,
  schemaFilter: ['public'],
  verbose: false,
});
