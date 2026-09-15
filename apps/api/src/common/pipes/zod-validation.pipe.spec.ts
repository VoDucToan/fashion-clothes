import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    quantity: z.coerce.number().int().positive(),
    variantId: z.uuid(),
  });
  const pipe = new ZodValidationPipe(schema);
  const variantId = '3f4a1d2e-9b6c-4a21-8f0e-7c5d9b2a1e34';

  it('coerces and returns parsed data', () => {
    // Query/body values arrive as strings over HTTP — the pipe hands the
    // controller a real number.
    expect(pipe.transform({ quantity: '2', variantId })).toEqual({
      quantity: 2,
      variantId,
    });
  });

  it('strips unknown keys so they never reach the service layer', () => {
    const result = pipe.transform({ quantity: 1, variantId, isAdmin: true });

    expect(result).not.toHaveProperty('isAdmin');
  });

  it('throws 400 with per-field details', () => {
    expect(() => pipe.transform({ quantity: 0, variantId: 'nope' })).toThrow(
      BadRequestException,
    );

    try {
      pipe.transform({ quantity: 0, variantId: 'nope' });
    } catch (error) {
      const response = (error as BadRequestException).getResponse() as {
        details: { path: string }[];
      };

      expect(response.details.map((issue) => issue.path).sort()).toEqual([
        'quantity',
        'variantId',
      ]);
    }
  });
});
