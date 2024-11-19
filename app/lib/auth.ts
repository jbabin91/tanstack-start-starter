/* eslint-disable sort-keys-fix/sort-keys-fix */
import { hash, verify } from '@node-rs/argon2';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { type Except, type SimplifyDeep, type UnknownRecord } from 'type-fest';
import { z } from 'zod';

import { db } from '@/db';
import { sessionSchema, userSchema } from '@/db/schema';
import { type InferZodObjectShape } from '@/lib/zod.ts';

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,
  baseURL: import.meta.env.VITE_APP_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash,
      verify,
    },
  },
  plugins: [admin()],
});

export const authSchema = z.discriminatedUnion('isAuthenticated', [
  z.object({
    isAuthenticated: z.literal(false),
    user: z.null(),
    session: z.null(),
  }),
  z.object({
    isAuthenticated: z.literal(true),
    user: userSchema,
    session: sessionSchema,
  }),
]);

export type Auth = z.infer<typeof authSchema>;
export type Authed = Extract<Auth, { isAuthenticated: true }>;

export type AuthAPI = keyof typeof auth.api;
export type InferAuthResult<API extends AuthAPI> = SimplifyDeep<
  Awaited<ReturnType<(typeof auth.api)[API]>>
>;
export type InferAuthOptions<API extends AuthAPI> = SimplifyDeep<
  NonNullable<Parameters<(typeof auth.api)[API]>[0]>
>;

export type InferAuthAPIZodShape<API extends AuthAPI> =
  InferAuthOptions<API> extends { body: UnknownRecord }
    ? InferZodObjectShape<Except<InferAuthOptions<API>['body'], 'callbackURL' | 'image'>>
    : InferAuthOptions<API> extends { query: UnknownRecord }
      ? InferZodObjectShape<Except<InferAuthOptions<API>['query'], 'callbackURL' | 'image'>>
      : never;
