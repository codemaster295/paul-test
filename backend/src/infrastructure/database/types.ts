export interface RunResult {
  lastID: number;
  changes: number;
}

export interface DatabaseConfig {
  filename: string;
  mode?: number;
  verbose?: boolean;
}

export interface IDatabase {
  run(sql: string, params?: any[]): Promise<RunResult>;
  get<T>(sql: string, params?: any[]): Promise<T | null>;
  all<T>(sql: string, params?: any[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
  transaction<T>(callback: () => Promise<T>): Promise<T>;
}
