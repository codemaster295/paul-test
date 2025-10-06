import { Request, Response } from 'express';
import { dbGet, dbRun, dbAll } from '../database';
import { CreatePublicationData, UpdatePublicationData, Publication } from '../types';
import { AuthRequest } from '../middleware/auth';

export const getPublications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT * FROM publications WHERE author_id = ? AND deleted_at IS NULL';
    const params: any[] = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), (parseInt(page as string) - 1) * parseInt(limit as string));
    
    const publications = await dbAll(query, params) as Publication[];
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM publications WHERE author_id = ? AND deleted_at IS NULL';
    const countParams: any[] = [userId];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const countResult = await dbGet(countQuery, countParams) as { total: number };
    
    res.json({
      publications,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: countResult.total,
        pages: Math.ceil(countResult.total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPublication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const publication = await dbGet(
      'SELECT * FROM publications WHERE id = ? AND author_id = ? AND deleted_at IS NULL',
      [id, userId]
    ) as Publication;
    
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }
    
    res.json({ publication });
  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPublication = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, status = 'draft' }: CreatePublicationData = req.body;
    const userId = req.user!.id;
    
    const result = await dbRun(
      'INSERT INTO publications (title, content, status, author_id) VALUES (?, ?, ?, ?)',
      [title, content, status, userId]
    );
    
    const publicationId = result.lastID;
    const publication = await dbGet(
      'SELECT * FROM publications WHERE id = ?',
      [publicationId]
    ) as Publication;
    
    res.status(201).json({
      message: 'Publication created successfully',
      publication
    });
  } catch (error) {
    console.error('Create publication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePublication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, status }: UpdatePublicationData = req.body;
    const userId = req.user!.id;
    
    // Check if publication exists and belongs to user
    const existingPublication = await dbGet(
      'SELECT * FROM publications WHERE id = ? AND author_id = ? AND deleted_at IS NULL',
      [id, userId]
    ) as Publication;
    
    if (!existingPublication) {
      return res.status(404).json({ error: 'Publication not found' });
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await dbRun(
      `UPDATE publications SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    const updatedPublication = await dbGet(
      'SELECT * FROM publications WHERE id = ?',
      [id]
    ) as Publication;
    
    res.json({
      message: 'Publication updated successfully',
      publication: updatedPublication
    });
  } catch (error) {
    console.error('Update publication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePublication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if publication exists and belongs to user
    const existingPublication = await dbGet(
      'SELECT * FROM publications WHERE id = ? AND author_id = ? AND deleted_at IS NULL',
      [id, userId]
    ) as Publication;
    
    if (!existingPublication) {
      return res.status(404).json({ error: 'Publication not found' });
    }
    
    // Soft delete
    await dbRun(
      'UPDATE publications SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    res.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkDeletePublications = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    const userId = req.user!.id;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of publication IDs is required' });
    }
    
    // Verify all publications belong to user
    const placeholders = ids.map(() => '?').join(',');
    const existingPublications = await dbAll(
      `SELECT id FROM publications WHERE id IN (${placeholders}) AND author_id = ? AND deleted_at IS NULL`,
      [...ids, userId]
    ) as { id: number }[];
    
    if (existingPublications.length !== ids.length) {
      return res.status(400).json({ error: 'Some publications not found or already deleted' });
    }
    
    // Soft delete all publications
    await dbRun(
      `UPDATE publications SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      ids
    );
    
    res.json({ 
      message: `${ids.length} publications deleted successfully`,
      deletedCount: ids.length
    });
  } catch (error) {
    console.error('Bulk delete publications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const restorePublication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if publication exists and belongs to user
    const existingPublication = await dbGet(
      'SELECT * FROM publications WHERE id = ? AND author_id = ? AND deleted_at IS NOT NULL',
      [id, userId]
    ) as Publication;
    
    if (!existingPublication) {
      return res.status(404).json({ error: 'Deleted publication not found' });
    }
    
    // Restore publication
    await dbRun(
      'UPDATE publications SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    const restoredPublication = await dbGet(
      'SELECT * FROM publications WHERE id = ?',
      [id]
    ) as Publication;
    
    res.json({
      message: 'Publication restored successfully',
      publication: restoredPublication
    });
  } catch (error) {
    console.error('Restore publication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
