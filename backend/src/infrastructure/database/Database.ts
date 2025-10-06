import sqlite3 from 'sqlite3';
import { ApiError } from '../errors/ApiError';
import { IDatabase, RunResult, DatabaseConfig } from './types';

export class Database implements IDatabase {
  private db: sqlite3.Database;
  private static instance: Database;

  private constructor(config: DatabaseConfig) {
    this.db = new sqlite3.Database(config.filename, (err) => {
      if (err) {
        throw new ApiError(500, `Failed to connect to database: ${err.message}`);
      }
    });
  }

  static getInstance(filename: string): Database {
    if (!Database.instance) {
      Database.instance = new Database({ filename });
    }
    return Database.instance;
  }

  async run(sql: string, params: any[] = []): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(new ApiError(500, `Database error: ${err.message}`));
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(new ApiError(500, `Database error: ${err.message}`));
        else resolve(row as T || null);
      });
    });
  }

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(new ApiError(500, `Database error: ${err.message}`));
        else resolve(rows as T[]);
      });
    });
  }

  async exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(new ApiError(500, `Database error: ${err.message}`));
        else resolve();
      });
    });
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      await this.run('BEGIN TRANSACTION');
      const result = await callback();
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(new ApiError(500, `Failed to close database: ${err.message}`));
        else resolve();
      });
    });
  }
}