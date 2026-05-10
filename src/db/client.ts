import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type AppDatabase = NodePgDatabase<typeof schema>;

interface DatabaseGlobal {
  __vibeLiveDb?: {
    pool: Pool;
    db: AppDatabase;
  };
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): AppDatabase | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  const databaseGlobal = globalThis as typeof globalThis & DatabaseGlobal;
  if (databaseGlobal.__vibeLiveDb) {
    return databaseGlobal.__vibeLiveDb.db;
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });
  databaseGlobal.__vibeLiveDb = { pool, db };
  return db;
}
