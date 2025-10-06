import axios, { AxiosError } from 'axios';
import { ErrorResponse } from '@/types/error';
import { Publication, CreatePublicationData, UpdatePublicationData, PublicationsResponse, PublicationStatus } from '@/types/publication';
import { User, LoginFormData, RegisterFormData } from '@/types/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  async login(data: LoginFormData): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterFormData): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const publicationsAPI = {
  async getPublications(
    page = 1,
    limit = 10,
    status?: PublicationStatus
  ): Promise<PublicationsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) {
      params.append('status', status);
    }
    const response = await api.get(`/publications?${params.toString()}`);
    return response.data;
  },

  async getPublication(id: number): Promise<Publication> {
    const response = await api.get(`/publications/${id}`);
    return response.data;
  },

  async createPublication(data: CreatePublicationData): Promise<Publication> {
    const response = await api.post('/publications', data);
    return response.data;
  },

  async updatePublication(
    id: number,
    data: UpdatePublicationData
  ): Promise<Publication> {
    const response = await api.put(`/publications/${id}`, data);
    return response.data;
  },

  async deletePublication(id: number): Promise<void> {
    await api.delete(`/publications/${id}`);
  },

  async bulkDeletePublications(ids: number[]): Promise<void> {
    await api.post('/publications/bulk-delete', { ids });
  },

  async restorePublication(id: number): Promise<Publication> {
    const response = await api.post(`/publications/${id}/restore`);
    return response.data;
  },
};

export function handleApiError(error: AxiosError<ErrorResponse>): string {
  if (error.response?.data?.data?.error) {
    return error.response.data.data.error;
  }
  return 'An unexpected error occurred';
}