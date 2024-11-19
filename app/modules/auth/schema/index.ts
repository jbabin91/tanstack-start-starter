/* eslint-disable sort-keys-fix/sort-keys-fix */
import { z } from 'zod';

import { type InferAuthAPIZodShape } from '@/lib/auth';
import { tKey } from '@/lib/i18n.ts';

export const NAME_MIN = 2;
export const NAME_MAX = 10;

export const USERNAME_MIN = 4;
export const USERNAME_MAX = 20;
export const USERNAME_REGEX = /^[\d_a-z-]*$/;

export const PASSWORD_MIN = 1; // TODO: Change to 8
export const PASSWORD_MAX = 100;
export const PASSWORD_ONE_UPPERCASE_REGEX = /.*[A-Z].*/;
export const PASSWORD_ONE_LOWERCASE_REGEX = /.*[a-z].*/;
export const PASSWORD_ONE_NUMBER_REGEX = /.*\d.*/;
export const PASSWORD_ONE_SPECIAL_REGEX = /.*[!"#$%&'()*+,./:;<=>?@[\\\]^_{|}~-].*/;

export const nameSchema = (t = tKey) =>
  z
    .string()
    .min(NAME_MIN, t('auth.name-min', { min: NAME_MIN }))
    .max(NAME_MAX, t('auth.name-max', { max: NAME_MAX }));

export const emailSchema = (t = tKey) => z.string().email(t('auth.email-invalid'));

export const usernameSchema = (t = tKey) =>
  z
    .string()
    .regex(USERNAME_REGEX, t('auth.username-regex'))
    .min(USERNAME_MIN, t('auth.username-min', { min: USERNAME_MIN }))
    .max(USERNAME_MAX, t('auth.username-max', { max: USERNAME_MAX }));

export const passwordSchema = (t = tKey) =>
  z
    .string()
    .min(PASSWORD_MIN, t('auth.password-min', { min: PASSWORD_MIN }))
    .max(PASSWORD_MAX, t('auth.password-max', { max: PASSWORD_MAX }));

export const signUpSchema = (t = tKey) =>
  z
    .object<InferAuthAPIZodShape<'signUpEmail'>>({
      name: nameSchema(t),
      email: emailSchema(t),
      password: passwordSchema(t),
    })
    .extend({
      passwordConfirm: passwordSchema(t),
    })
    .refine((values) => values.password === values.passwordConfirm, {
      path: ['passwordConfirm'],
      message: t('auth.password-must-match'),
    });

export const signInSchema = (t = tKey) =>
  z.object<InferAuthAPIZodShape<'signInEmail'>>({
    email: emailSchema(t),
    password: passwordSchema(t),
    rememberMe: z.boolean().optional(),
  });
