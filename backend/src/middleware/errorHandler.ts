import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../infrastructure/errors/ApiError';
import { ERROR_MESSAGES } from '../config/constants';
import { env } from '../config/environment';

export class ErrorHandler {
  static handle(
    error: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        ...(env.isDevelopment && { details: error.details }),
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message,
      });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }

    // Handle unexpected errors
    return res.status(500).json({
      success: false,
      error: env.isProduction
        ? ERROR_MESSAGES.SERVER_ERROR
        : error.message,
    });
  }

  static notFound(req: Request, res: Response) {
    res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.path} not found`,
    });
  }

  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
