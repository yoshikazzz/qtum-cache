import * as dotenv from 'dotenv';
// load env vars into process.env
dotenv.config();

export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: string;
  storage: string;
  logging: boolean | Function;
  force: boolean;
  timezone: string;
}

export const databaseConfig: DatabaseConfig = {
  username: 'root',
  password: process.env.DB_PW,
  database: 'qtum_cache',
  host: '127.0.0.1',
  port: 3306,
  force: false,
  logging: false,
  timezone: '+00:00',
  dialect: 'mysql',
  storage: 'database.sqlite',
};
