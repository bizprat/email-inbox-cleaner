import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });

// Ensure the database is properly closed when the application shuts down
process.on('SIGINT', () => {
  sqlite.close();
  process.exit();
});
