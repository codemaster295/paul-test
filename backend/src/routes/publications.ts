import { Router } from 'express';
import {
  getPublications,
  getPublication,
  createPublication,
  updatePublication,
  deletePublication,
  bulkDeletePublications,
  restorePublication
} from '../controllers/publications';
import { validateCreatePublication, validateUpdatePublication } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All publication routes require authentication
router.use(authenticateToken);

// CRUD operations
router.get('/', getPublications);
router.get('/:id', getPublication);
router.post('/', validateCreatePublication, createPublication);
router.put('/:id', validateUpdatePublication, updatePublication);
router.delete('/:id', deletePublication);

// Bulk operations
router.post('/bulk-delete', bulkDeletePublications);
router.post('/:id/restore', restorePublication);

export default router;