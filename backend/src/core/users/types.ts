import { BaseEntity } from '../../interfaces/common/types';

export interface User extends BaseEntity {
  email: string;
  name: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  userId: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
