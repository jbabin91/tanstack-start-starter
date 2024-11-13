import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '@/configs/env.ts';

import * as schema from './schema';

const client = postgres(env.DATABASE_URL);
export const db = drizzle({ casing: 'snake_case', client, schema });
