export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Publication {
  id: number;
  title: string;
  content: string;
  status: PublicationStatus;
  author_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type PublicationStatus = 'draft' | 'published' | 'archived';

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

// AuthRequest is defined in middleware/auth.ts

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}
