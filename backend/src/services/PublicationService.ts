import { IPublicationRepository } from '../interfaces/repositories/IPublicationRepository';
import { Publication, CreatePublicationDTO, UpdatePublicationDTO, PublicationFilters } from '../core/publications/types';
import { PaginatedResult } from '../interfaces/common/types';
import { ApiError } from '../infrastructure/errors/ApiError';
import { ERROR_MESSAGES, PAGINATION } from '../config/constants';

export class PublicationService {
  constructor(private publicationRepository: IPublicationRepository) {}

  async getPublications(
    authorId: number,
    filters: PublicationFilters
  ): Promise<PaginatedResult<Publication>> {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status } = filters;

    return this.publicationRepository.findByAuthor(authorId, {
      page: Math.min(page, 1),
      limit: Math.min(limit, PAGINATION.MAX_LIMIT),
      status,
    });
  }

  async getPublication(id: number, authorId: number): Promise<Publication> {
    const publication = await this.publicationRepository.findById(id);
    
    if (!publication) {
      throw new ApiError(404, ERROR_MESSAGES.PUBLICATION_NOT_FOUND);
    }

    if (publication.author_id !== authorId) {
      throw new ApiError(403, ERROR_MESSAGES.UNAUTHORIZED);
    }

    return publication;
  }

  async createPublication(
    authorId: number,
    data: CreatePublicationDTO
  ): Promise<Publication> {
    return this.publicationRepository.create({
      ...data,
      author_id: authorId,
      status: data?.status || 'DRAFT',
    });
  }

  async updatePublication(
    id: number,
    authorId: number,
    data: UpdatePublicationDTO
  ): Promise<Publication> {
    const publication = await this.getPublication(id, authorId);

    return this.publicationRepository.update(id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
  }

  async deletePublication(id: number, authorId: number): Promise<void> {
    await this.getPublication(id, authorId);
    await this.publicationRepository.softDelete(id);
  }

  async bulkDeletePublications(ids: number[], authorId: number): Promise<number> {
    if (!ids.length) {
      throw new ApiError(400, 'No publications specified for deletion');
    }

    const deletedCount = await this.publicationRepository.bulkSoftDelete(ids, authorId);
    
    if (deletedCount === 0) {
      throw new ApiError(404, 'No publications found or authorized for deletion');
    }

    return deletedCount;
  }

  async restorePublication(id: number, authorId: number): Promise<Publication> {
    const publication = await this.publicationRepository.findById(id);
    
    if (!publication || publication.author_id !== authorId) {
      throw new ApiError(404, ERROR_MESSAGES.PUBLICATION_NOT_FOUND);
    }

    return this.publicationRepository.restore(id);
  }
}
