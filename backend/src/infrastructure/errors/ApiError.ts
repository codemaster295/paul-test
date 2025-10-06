export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static BadRequest(message: string, details?: any): ApiError {
    return new ApiError(400, message, details);
  }

  static Unauthorized(message: string, details?: any): ApiError {
    return new ApiError(401, message, details);
  }

  static Forbidden(message: string, details?: any): ApiError {
    return new ApiError(403, message, details);
  }

  static NotFound(message: string, details?: any): ApiError {
    return new ApiError(404, message, details);
  }

  static Conflict(message: string, details?: any): ApiError {
    return new ApiError(409, message, details);
  }

  static InternalServer(message: string = 'Internal Server Error', details?: any): ApiError {
    return new ApiError(500, message, details);
  }
}