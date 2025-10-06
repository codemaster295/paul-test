import { z } from 'zod';
import { VALIDATION, PUBLICATION_STATUS } from '../../config/constants';

// Auth schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(
      VALIDATION.PASSWORD_MIN_LENGTH,
      `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
    ),
    name: z.string().min(1, 'Name is required'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Publication schemas
export const createPublicationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required')
      .max(VALIDATION.TITLE_MAX_LENGTH, `Title cannot exceed ${VALIDATION.TITLE_MAX_LENGTH} characters`),
    content: z.string().min(1, 'Content is required')
      .max(VALIDATION.CONTENT_MAX_LENGTH, `Content cannot exceed ${VALIDATION.CONTENT_MAX_LENGTH} characters`),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});

export const updatePublicationSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(VALIDATION.TITLE_MAX_LENGTH, `Title cannot exceed ${VALIDATION.TITLE_MAX_LENGTH} characters`)
      .optional(),
    content: z.string()
      .min(1, 'Content is required')
      .max(VALIDATION.CONTENT_MAX_LENGTH, `Content cannot exceed ${VALIDATION.CONTENT_MAX_LENGTH} characters`)
      .optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(z.number()).min(1, 'At least one publication ID must be provided'),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});