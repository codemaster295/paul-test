import { Publication, PublicationStatus } from '../../core/publications/types';
import { PaginationParams, PaginatedResult } from '../common/types';

export interface IPublicationRepository {
  findById(id: number): Promise<Publication | null>;
  findByAuthor(
    authorId: number,
    params: PaginationParams & { status?: PublicationStatus }
  ): Promise<PaginatedResult<Publication>>;
  create(publication: Omit<Publication, 'id' | 'created_at' | 'updated_at'>): Promise<Publication>;
  update(id: number, data: Partial<Publication>): Promise<Publication>;
  softDelete(id: number): Promise<void>;
  restore(id: number): Promise<Publication>;
  bulkSoftDelete(ids: number[], authorId: number): Promise<number>;
}
