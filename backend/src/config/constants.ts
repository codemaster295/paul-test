export const AUTH = {
  SALT_ROUNDS: 12,
  TOKEN_EXPIRY: '7d',
  COOKIE_NAME: 'auth_token',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  TITLE_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 50000,
} as const;

export const PUBLICATION_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  PUBLICATION_NOT_FOUND: 'Publication not found',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'Internal server error',
} as const;
