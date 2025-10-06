import { Request, Response, NextFunction } from 'express';
import { ZodObject,z, ZodError } from 'zod';
import { ApiError } from '../../infrastructure/errors/ApiError';

export class Validator {
  static validate(schema: ZodObject) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          next(new ApiError(400, 'Validation failed', {
            errors: error.issues.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          }));
        } else {
          next(error);
        }
      }
    };
  }

  static validateBody(schema: ZodObject) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const validData = await schema.parseAsync(req.body);
        req.body = validData;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          next(new ApiError(400, 'Validation failed', {
            errors: error.issues.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          }));
        } else {
          next(error);
        }
      }
    };
  }

  static validateQuery<T extends ZodObject<any>>(schema: T) {
    return async (req: Request<any, any, any, z.infer<T>>, res: Response, next: NextFunction) => {
      try {
        const validData = await schema.parseAsync(req.query);
        req.query = validData;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          next(new ApiError(400, 'Invalid query parameters', {
            errors: error.issues.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          }));
        } else {
          next(error);
        }
      }
    };
  }

  static validateParams<T extends ZodObject<any>>(schema: T) {
    return async (req: Request<z.infer<T>>, res: Response, next: NextFunction) => {
      try {
        const validData = await schema.parseAsync(req.params);
        req.params = validData;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          next(new ApiError(400, 'Invalid route parameters', {
            errors: error.issues.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          }));
        } else {
          next(error);
        }
      }
    };
  }
}
