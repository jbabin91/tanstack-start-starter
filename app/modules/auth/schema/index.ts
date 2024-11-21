/* eslint-disable sort-keys-fix/sort-keys-fix */
import { z } from 'zod';

import { type InferAuthAPIZodShape } from '@/lib/auth';
import i18n from '@/lib/i18n';

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

export const nameSchema = z
  .string()
  .min(NAME_MIN, i18n.t('auth.name-min', { min: NAME_MIN }))
  .max(NAME_MAX, i18n.t('auth.name-max', { max: NAME_MAX }));

export const emailSchema = z.string().email(i18n.t('auth.email-invalid'));

export const usernameSchema = z
  .string()
  .regex(USERNAME_REGEX, i18n.t('auth.username-regex'))
  .min(USERNAME_MIN, i18n.t('auth.username-min', { min: USERNAME_MIN }))
  .max(USERNAME_MAX, i18n.t('auth.username-max', { max: USERNAME_MAX }));

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, i18n.t('auth.password-min', { min: PASSWORD_MIN }))
  .max(PASSWORD_MAX, i18n.t('auth.password-max', { max: PASSWORD_MAX }));

export const signUpSchema = z
  .object<InferAuthAPIZodShape<'signUpEmail'>>({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .extend({
    passwordConfirm: passwordSchema,
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: i18n.t('auth.password-must-match'),
  });

export const signInSchema = z.object<InferAuthAPIZodShape<'signInEmail'>>({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});
