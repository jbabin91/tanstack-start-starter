import { createServerOnlyFn } from '@tanstack/react-start';
import { drizzle } from 'drizzle-orm/node-postgres';

import { env } from '@/configs/env';

import * as schema from './schemas';

const getDatabase = createServerOnlyFn(() =>
  drizzle(env.DATABASE_URL, {
    casing: 'snake_case',
    schema,
  }),
);

export const db = getDatabase();
