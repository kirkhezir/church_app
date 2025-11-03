import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Validation target - where to validate data from
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation middleware factory using Zod schemas
 * Validates request data and returns 400 error if validation fails
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Get data to validate based on target
      let dataToValidate: unknown;
      switch (target) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      // Validate data against schema
      const validated = schema.parse(dataToValidate);

      // Replace request data with validated data
      switch (target) {
        case 'body':
          req.body = validated;
          break;
        case 'query':
          req.query = validated as any;
          break;
        case 'params':
          req.params = validated as any;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation failed', {
          target,
          path: req.path,
          errors: error.errors,
        });

        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid request data',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
        return;
      }

      // Unexpected error
      logger.error('Validation middleware error', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Validation failed',
      });
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validate query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Validate URL parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
