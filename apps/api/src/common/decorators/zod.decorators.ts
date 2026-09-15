import { Body, Param, Query } from '@nestjs/common';
import type { ZodType } from 'zod';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';

/**
 * Thin wrappers so controllers read as:
 *   create(@ZodBody(createProductSchema) dto: CreateProductDto)
 * instead of repeating `new ZodValidationPipe(...)` at every parameter.
 */
export const ZodBody = <T>(schema: ZodType<T>) =>
  Body(new ZodValidationPipe(schema));

export const ZodQuery = <T>(schema: ZodType<T>) =>
  Query(new ZodValidationPipe(schema));

export const ZodParam = <T>(schema: ZodType<T>) =>
  Param(new ZodValidationPipe(schema));
