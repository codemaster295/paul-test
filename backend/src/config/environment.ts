import dotenv from 'dotenv';
import { cleanEnv, str, port, url } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  PORT: port({ default: 5000 }),
  JWT_SECRET: str(),
  CORS_ORIGIN: str({ default: 'http://localhost:3000' }),
  DATABASE_URL: url({ default: 'sqlite://./database.sqlite' }),
});

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
