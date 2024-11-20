/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { z } from 'zod';

import { logger } from '@/lib/logger';
import { handleZodErrors } from '@/lib/zod';

const PUBLIC_ENV_PREFIX = 'VITE_';

const publicSchema = createEnvSchema('Public', {
  VITE_APP_NAME: z.string(),
  VITE_APP_URL: z.string(),
});

const privateSchema = createEnvSchema('Private', {
  APP_SECRET: z.string(),
  AUTH_SECRET: z.string(),
  DATABASE_URL: z.string(),
  // DISCORD_CLIENT_ID: z.string(),
  // DISCORD_CLIENT_SECRET: z.string(),
  // GITHUB_CLIENT_ID: z.string(),
  // GITHUB_CLIENT_SECRET: z.string(),
  // GOOGLE_CLIENT_ID: z.string(),
  // GOOGLE_CLIENT_SECRET: z.string(),
});

function parseEnv() {
  const result = z
    .object({
      ...publicSchema.shape,
      ...privateSchema.shape,
    })
    .safeParse({
      ...import.meta.env,
      ...process.env,
    });

  if (result.error) {
    handleZodErrors(result.error);
    throw new Error('Invalid environment variables');
  }

  const total = Object.keys(result.data).length;

  logger.info(`Environment variables parsed successfully (${total} variables)`);
}

function createEnvSchema<Shape extends z.ZodRawShape>(type: 'Public' | 'Private', shape: Shape) {
  for (const key in shape) {
    if (type === 'Public' && !key.startsWith(PUBLIC_ENV_PREFIX)) {
      throw new Error(
        `Public environment variables must start with "${PUBLIC_ENV_PREFIX}", got "${key}`,
      );
    }

    if (type === 'Private' && key.startsWith(PUBLIC_ENV_PREFIX)) {
      throw new Error(
        `Private environment variables must not start with "${PUBLIC_ENV_PREFIX}", got "${key}`,
      );
    }
  }

  return z.object(shape);
}

type ViteBuiltInEnv = {
  MODE: 'development' | 'production' | 'test';
  DEV: boolean;
  SSR: boolean;
  PROD: boolean;
  BASE_URL: string;
};

declare global {
  interface ImportMetaEnv extends z.infer<typeof publicSchema>, ViteBuiltInEnv {}

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof privateSchema> {}
  }
}

export { parseEnv };
