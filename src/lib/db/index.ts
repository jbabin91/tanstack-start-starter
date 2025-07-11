import { drizzle } from 'drizzle-orm/node-postgres';

import { env } from '@/configs/env';

import * as schema from './schemas';

export const db = drizzle(env.DATABASE_URL, {
  casing: 'snake_case',
  schema,
});
