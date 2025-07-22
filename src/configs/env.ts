import { type } from 'arktype';

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverSchema = type({
  DATABASE_URL: 'string.url>=1',
  RESEND_API_KEY: 'string>=1',
  SENDER_EMAIL_ADDRESS: 'string?',
});

/**
 * Client-side environment variables schema
 * These are exposed to the client (must be prefixed with VITE_)
 */
const clientSchema = type({
  // Add client env vars here with VITE_ prefix
  // VITE_API_URL: 'string',
});

type ServerEnv = typeof serverSchema.infer;
type ClientEnv = typeof clientSchema.infer;

/**
 * Validates and creates a type-safe environment object
 */
function createEnv<
  TServer extends ServerEnv,
  TClient extends ClientEnv,
>(config: {
  server: TServer;
  client: TClient;
  clientPrefix?: string;
  skipValidation?: boolean;
  isServer?: boolean;
  runtimeEnv?: Record<string, string | undefined>;
  emptyStringAsUndefined?: boolean;
}): TServer & TClient {
  const {
    server,
    client,
    clientPrefix = 'VITE_',
    skipValidation = false,
    isServer = globalThis.window === undefined,
    runtimeEnv = process.env,
    emptyStringAsUndefined = false,
  } = config;

  // Skip validation if explicitly requested (useful for build time)
  if (skipValidation) {
    return { ...server, ...client };
  }

  // Validate client variable names have proper prefix
  const clientVarKeys = Object.keys(client);
  const invalidClientKeys = clientVarKeys.filter(
    (key) => !key.startsWith(clientPrefix),
  );
  if (invalidClientKeys.length > 0) {
    throw new Error(
      `Invalid client environment variable names. Client variables must be prefixed with "${clientPrefix}". Invalid keys: ${invalidClientKeys.join(', ')}`,
    );
  }

  // Process runtime environment variables
  let processedEnv = { ...runtimeEnv };

  // Convert empty strings to undefined if requested
  if (emptyStringAsUndefined) {
    processedEnv = Object.fromEntries(
      Object.entries(processedEnv).map(([key, value]) => [
        key,
        value === '' ? undefined : value,
      ]),
    );
  }

  // Get environment variables from runtime environment with defaults applied
  const envVars = {
    ...processedEnv,
    // Apply default for NODE_ENV if not set
    NODE_ENV: processedEnv.NODE_ENV ?? 'development',
  };

  // Check for missing required environment variables
  const serverKeys = Object.keys(server);
  const clientKeys = Object.keys(client);

  const missingServerVars = isServer
    ? serverKeys.filter(
        (key) => !(key in envVars) || (envVars as any)[key] === undefined,
      )
    : [];

  const missingClientVars = clientKeys.filter(
    (key) => !(key in envVars) || (envVars as any)[key] === undefined,
  );

  if (missingServerVars.length > 0) {
    // Only show available vars that are required by server schema
    const availableVars = serverKeys.filter(
      (key) => (envVars as any)[key] !== undefined,
    );
    const requiredVars = serverKeys;
    throw new Error(
      [
        '\n❌ Environment Validation Error',
        '',
        'Missing required server environment variables:',
        ...missingServerVars.map((v) => `  - ${v}`),
        '',
        'How to fix:',
        '  1. Set these variables in your .env file or deployment platform.',
        '  2. See README for details.',
        '',
        'Available env vars:',
        ...availableVars.map((v) => `  - ${v}`),
        '',
        'Required server vars:',
        ...requiredVars.map((v) => `  - ${v}`),
        '',
      ].join('\n'),
    );
  }

  if (missingClientVars.length > 0) {
    throw new Error(
      `Missing required client environment variables: ${missingClientVars.join(', ')}`,
    );
  }

  // Validate server variables only on server
  if (isServer) {
    try {
      serverSchema.assert(envVars);
    } catch (error) {
      console.error('❌ Invalid server environment variables:');
      console.error('Available env vars:', Object.keys(envVars));
      console.error('Required server vars:', Object.keys(server));
      console.error(
        'Make sure all required server environment variables are set.',
      );
      console.error('Full error:', error);
      throw error;
    }
  }

  // Validate client variables (available on both server and client)
  try {
    clientSchema.assert(envVars);
  } catch (error) {
    console.error('❌ Invalid client environment variables:');
    console.error(
      `Make sure all required client environment variables are set and prefixed with "${clientPrefix}".`,
    );
    throw error;
  }

  // Filter environment variables based on context
  const result: Record<string, unknown> = {};

  // Add server variables (only on server)
  if (isServer) {
    for (const key of Object.keys(server) as (keyof TServer)[]) {
      result[key as string] = server[key];
    }
  }

  // Add client variables (available everywhere)
  for (const key of Object.keys(client) as (keyof TClient)[]) {
    result[key as string] = client[key];
  }

  return result as TServer & TClient;
}

/**
 * Type-safe environment variables
 */
export const env = createEnv({
  client: {
    // Add your client-side environment variables here
    // They must be prefixed with VITE_ to be exposed to the client
  },
  server: {
    DATABASE_URL: process.env.DATABASE_URL!,
    RESEND_API_KEY: process.env.RESEND_API_KEY!,
    SENDER_EMAIL_ADDRESS:
      process.env.SENDER_EMAIL_ADDRESS ?? 'support@example.com',
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});

// Export types for external use
export type { ClientEnv, ServerEnv };
