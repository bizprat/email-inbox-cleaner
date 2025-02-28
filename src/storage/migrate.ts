import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

async function runMigrations() {
  const sqlite = new Database('sqlite.db');
  const db = drizzle(sqlite, { schema });

  console.log('Running migrations...');

  await migrate(db, {
    migrationsFolder: './drizzle',
  });

  console.log('Migrations complete.');
  sqlite.close();
}

runMigrations().catch(console.error);
