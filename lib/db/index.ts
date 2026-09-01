/**
 * Drizzle database client singleton backed by PostgreSQL.
 *
 * Uses a single shared connection pool. In development the pool is cached on
 * globalThis so Next.js hot-reloads do not leak connections.
 */
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import postgres, { type Sql } from "postgres";
import { ConfigurationError } from "@/lib/auth/errors";

import * as schema from "./schema";

/**
 * Database handle accepted across the app. Production uses the postgres-js
 * driver; tests use a pg-mem-backed node-postgres instance. Both satisfy the
 * same Drizzle query-builder API, so a repository can accept either.
 */
export type DrizzleDb =
  PostgresJsDatabase<typeof schema> | NodePgDatabase<typeof schema>;

declare global {
  var __postgres: Sql | undefined;
}

/** Creates a fresh postgres.js client connected to the configured database. */
function createClient(): Sql {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new ConfigurationError("DATABASE_URL is not set");
  }
  return postgres(connectionString);
}

const client: Sql = global.__postgres ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.__postgres = client;
}

export const db: DrizzleDb = drizzle(client, { schema });

export default db;
