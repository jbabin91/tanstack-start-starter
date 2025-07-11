import { type } from 'arktype';

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverSchema = type({
  DATABASE_URL: 'string',
  'NODE_ENV?': "'development' | 'production' | 'test'",
});

/**
 * Client-side environment variables schema
 * These are exposed to the client (must be prefixed with VITE_)
 */
const clientSchema = type({
  // Add client env vars here with VITE_ prefix
  // VITE_API_URL?: 'string',
});

type ServerEnv = typeof serverSchema.infer;
type ClientEnv = typeof clientSchema.infer;

/**
 * Validates and creates a type-safe environment object
 */
function createEnv<
  TServer extends Record<string, unknown>,
  TClient extends Record<string, unknown>,
>(config: {
  server: TServer;
  client: TClient;
  skipValidation?: boolean;
  isServer?: boolean;
}): TServer & TClient {
  const {
    server,
    client,
    skipValidation = false,
    isServer = typeof globalThis === 'undefined' || !('window' in globalThis),
  } = config;

  // Skip validation if explicitly requested (useful for build time)
  if (skipValidation) {
    return { ...server, ...client };
  }

  // Get environment variables from process.env with defaults applied
  const envVars = {
    ...process.env,
    // Apply default for NODE_ENV if not set
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  };

  // Validate server variables only on server
  if (isServer) {
    const serverValidation = serverSchema(envVars);
    if (serverValidation instanceof type.errors) {
      console.error('❌ Invalid server environment variables:');
      for (const error of serverValidation) {
        console.error(`  ${error.path}: ${error.message}`);
      }
      throw new Error('Invalid server environment variables');
    }
  }

  // Validate client variables (available on both server and client)
  const clientValidation = clientSchema(envVars);
  if (clientValidation instanceof type.errors) {
    console.error('❌ Invalid client environment variables:');
    for (const error of clientValidation) {
      console.error(`  ${error.path}: ${error.message}`);
    }
    throw new Error('Invalid client environment variables');
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
    NODE_ENV:
      (process.env.NODE_ENV as 'development' | 'production' | 'test') ??
      'development',
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});

// Export types for external use
export type { ClientEnv, ServerEnv };
