import { User, UserWithPassword } from '../../core/users/types';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<UserWithPassword | null>;
  create(user: Omit<UserWithPassword, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
}
