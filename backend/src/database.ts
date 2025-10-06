import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./database.sqlite');

// Database result types
interface RunResult {
  lastID: number;
  changes: number;
}

// Promisify database methods
export const dbRun = (sql: string, params: any[] = []): Promise<RunResult> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const initDatabase = async () => {
  try {
    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create publications table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS publications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        author_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_publications_author_id ON publications(author_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_publications_deleted_at ON publications(deleted_at)`);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default db;
