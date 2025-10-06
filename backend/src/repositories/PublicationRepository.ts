import { IPublicationRepository } from '../interfaces/repositories/IPublicationRepository';
import { Publication, PublicationStatus } from '../core/publications/types';
import { PaginationParams, PaginatedResult } from '../interfaces/common/types';
import { Database } from '../infrastructure/database';
import { ApiError } from '../infrastructure/errors/ApiError';
import { PAGINATION } from '../config/constants';

export class PublicationRepository implements IPublicationRepository {
  constructor(private db: Database) {}

  async findById(id: number): Promise<Publication | null> {
    try {
      const publication = await this.db.get<Publication>(
        'SELECT * FROM publications WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      return publication;
    } catch (error) {
      throw ApiError.InternalServer('Failed to fetch publication');
    }
  }

  async findByAuthor(
    authorId: number,
    params: PaginationParams & { status?: PublicationStatus }
  ): Promise<PaginatedResult<Publication>> {
    try {
      const pageNum = typeof params.page === 'number' ? params.page : PAGINATION.DEFAULT_PAGE;
      const limitNum = typeof params.limit === 'number' ? params.limit : PAGINATION.DEFAULT_LIMIT;
      const offset = (pageNum - 1) * limitNum;

      let query = 'SELECT * FROM publications WHERE author_id = ? AND deleted_at IS NULL';
      const queryParams: any[] = [authorId];

      if (params.status) {
        query += ' AND status = ?';
        queryParams.push(params.status);
      }

      query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limitNum, offset);

      const publications = await this.db.all<Publication>(query, queryParams);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM publications WHERE author_id = ? AND deleted_at IS NULL';
      const countParams: Array<number | string> = [authorId];

      if (params.status) {
        countQuery += ' AND status = ?';
        countParams.push(params.status);
      }

      const countResult = await this.db.get<{ total: number }>(countQuery, countParams);
      const total = countResult?.total || 0;

      return {
        data: publications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      throw ApiError.InternalServer('Failed to fetch publications');
    }
  }

  async create(publication: Omit<Publication, 'id' | 'created_at' | 'updated_at'>): Promise<Publication> {
    try {
      const result = await this.db.run(
        'INSERT INTO publications (title, content, status, author_id) VALUES (?, ?, ?, ?)',
        [publication.title, publication.content, publication.status, publication.author_id]
      );

      const created = await this.findById(result.lastID);
      if (!created) {
        throw ApiError.InternalServer('Failed to create publication');
      }

      return created;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.InternalServer('Failed to create publication');
    }
  }

  async update(id: number, data: Partial<Publication>): Promise<Publication> {
    try {
      const fields = Object.keys(data).filter(key => !['id', 'author_id', 'created_at', 'updated_at'].includes(key));
      if (fields.length === 0) {
        throw ApiError.BadRequest('No valid fields to update');
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = [...fields.map(field => (data as any)[field]), id];

      await this.db.run(
        `UPDATE publications SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`,
        values
      );

      const updated = await this.findById(id);
      if (!updated) {
        throw ApiError.NotFound('Publication not found');
      }

      return updated;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.InternalServer('Failed to update publication');
    }
  }

  async softDelete(id: number): Promise<void> {
    try {
      const result = await this.db.run(
        'UPDATE publications SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
        [id]
      );
      if (result.changes === 0) {
        throw ApiError.NotFound('Publication not found or already deleted');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.InternalServer('Failed to delete publication');
    }
  }

  async restore(id: number): Promise<Publication> {
    try {
      const result = await this.db.run(
        'UPDATE publications SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NOT NULL',
        [id]
      );
      if (result.changes === 0) {
        throw ApiError.NotFound('Publication not found or not deleted');
      }

      const restored = await this.findById(id);
      if (!restored) {
        throw ApiError.InternalServer('Failed to restore publication');
      }

      return restored;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.InternalServer('Failed to restore publication');
    }
  }

  async bulkSoftDelete(ids: number[], authorId: number): Promise<number> {
    try {
      const placeholders = ids.map(() => '?').join(',');
      const result = await this.db.run(
        `UPDATE publications SET deleted_at = CURRENT_TIMESTAMP 
         WHERE id IN (${placeholders}) AND author_id = ? AND deleted_at IS NULL`,
        [...ids, authorId]
      );
      return result.changes;
    } catch (error) {
      throw ApiError.InternalServer('Failed to bulk delete publications');
    }
  }
}