import { type IsEqual } from 'type-fest';
import { type z } from 'zod';

import { logger } from './logger.ts';

export type InferZodObjectShape<T extends object> = {
  [Key in keyof T]-?: IsEqual<T[Key], Exclude<T[Key], undefined>> extends false
    ? z.ZodOptional<z.ZodType<T[Key]>> | z.ZodPipeline<z.ZodOptional<z.ZodAny>, z.ZodType<T[Key]>>
    : z.ZodType<T[Key]> | z.ZodPipeline<z.ZodAny, z.ZodType<T[Key]>>;
};

export function formatZodErrors(error: z.ZodError): string[] {
  if (error.issues.length > 0) {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  }

  throw new Error('Invalid ZodError');
}

export function handleZodErrors(error: z.ZodError) {
  for (const message of formatZodErrors(error)) {
    logger.error(message);
  }
}
