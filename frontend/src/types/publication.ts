export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface Publication {
  id: number;
  title: string;
  content: string;
  status: PublicationStatus;
  author_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreatePublicationData {
  title: string;
  content: string;
  status?: PublicationStatus;
}

export interface UpdatePublicationData {
  title?: string;
  content?: string;
  status?: PublicationStatus;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PublicationsResponse {
  publications: Publication[];
  pagination: Pagination;
}
