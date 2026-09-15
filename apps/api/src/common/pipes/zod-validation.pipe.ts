import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

/**
 * Validates and *parses* incoming payloads with a Zod schema.
 *
 * Why Zod instead of class-validator: the same schema file can be shared with
 * the Next.js app (react-hook-form + zodResolver), so a field's rules are
 * written once. The pipe returns `result.data`, which means the controller
 * receives coerced, stripped, fully typed input — unknown keys never reach
 * the service layer.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        error: 'ValidationError',
        message: 'Request validation failed',
        details: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    return result.data;
  }
}
