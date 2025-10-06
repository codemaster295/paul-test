import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { User, UserWithPassword } from '../core/users/types';
import { Database } from '../infrastructure/database/Database';
import { ApiError } from '../infrastructure/errors/ApiError';

export class UserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: number): Promise<User | null> {
    try {
      const user = await this.db.get<User>(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return user || null;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch user');
    }
  }

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      const user = await this.db.get<UserWithPassword>(
        'SELECT id, email, password, name, created_at, updated_at FROM users WHERE email = ?',
        [email]
      );
      return user || null;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch user');
    }
  }

  async create(userData: Omit<UserWithPassword, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      const result = await this.db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [userData.email, userData.password, userData.name]
      );

      const user = await this.findById(result.lastID);
      if (!user) {
        throw new ApiError(500, 'Failed to create user');
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to create user');
    }
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    try {
      const fields = Object.keys(data);
      if (fields.length === 0) {
        throw new ApiError(400, 'No fields to update');
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(data), id];

      await this.db.run(
        `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      const user = await this.findById(id);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to update user');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.db.run('DELETE FROM users WHERE id = ?', [id]);
      if (result.changes === 0) {
        throw new ApiError(404, 'User not found');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Failed to delete user');
    }
  }
}
