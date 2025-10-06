import { BaseEntity } from '../../interfaces/common/types';
import { PUBLICATION_STATUS } from '../../config/constants';

export type PublicationStatus = keyof typeof PUBLICATION_STATUS;

export interface Publication extends BaseEntity {
  title: string;
  content: string;
  status: PublicationStatus;
  author_id: number;
  deleted_at?: string | null;
}

export interface CreatePublicationDTO {
  title: string;
  content: string;
  status?: PublicationStatus;
}

export interface UpdatePublicationDTO {
  title?: string;
  content?: string;
  status?: PublicationStatus;
}

export interface BulkDeleteDTO {
  ids: number[];
}

export interface PublicationFilters {
  status?: PublicationStatus;
  page?: number;
  limit?: number;
}
