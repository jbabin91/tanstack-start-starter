/* eslint-disable @typescript-eslint/consistent-type-definitions */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  readonly BASE_URL: string;
  // Add custom client-side environment variables here (must be prefixed with VITE_)
  // readonly VITE_API_URL: string;
  // readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Server-side environment variables (aligned with src/configs/env.ts)
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly BETTER_AUTH_SECRET: string;
      readonly BETTER_AUTH_URL: string;
      readonly DATABASE_URL: string;
      readonly RESEND_API_KEY: string;
      readonly SENDER_EMAIL_ADDRESS?: string;
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly SKIP_ENV_VALIDATION?: string;
    }
  }
}
