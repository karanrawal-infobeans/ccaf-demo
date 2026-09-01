/**
 * In-memory PostgreSQL test database backed by pg-mem.
 *
 * Exposes a Drizzle instance structurally compatible with the production
 * PostgresJsDatabase so application code (repositories, services, routes) can
 * run unchanged against a real, in-memory Postgres during tests.
 *
 * Pairs with `drizzle-pgmem` to shim the pg protocol details that Drizzle's
 * node-postgres driver relies on but pg-mem does not implement.
 */
import { newDb, type IMemoryDb } from "pg-mem";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { applyIntegrationsToPool } from "drizzle-pgmem";

import * as schema from "@/lib/db/schema";

let memoryDb: IMemoryDb | null = null;
let pgPool: Pool | null = null;
let drizzleDb: NodePgDatabase<typeof schema> | null = null;

/** DDL matching the Drizzle schema, applied to a fresh in-memory database. */
const SCHEMA_DDL = `
  CREATE TYPE role AS ENUM ('CUSTOMER', 'ADMIN', 'CUSTOMER_SUPPORT');
  CREATE TABLE users (
    id         UUID PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    name       VARCHAR(255) NOT NULL,
    password   TEXT NOT NULL,
    role       role NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
  );
`;

/** Returns a shared in-memory Drizzle database, initialising it on first use. */
export function getTestDb(): NodePgDatabase<typeof schema> {
  if (drizzleDb) return drizzleDb;

  memoryDb = newDb();
  memoryDb.public.none(SCHEMA_DDL);

  const { Pool: MemPool } = memoryDb.adapters.createPg();
  const pool = new MemPool();
  applyIntegrationsToPool(pool);

  pgPool = pool;
  drizzleDb = drizzle(pool, { schema });
  return drizzleDb;
}

/**
 * Shared in-memory Drizzle instance. Initialised on first access.
 * Route tests alias this as the default export of "@/lib/db".
 */
export default getTestDb();

/** Clears every row from the users table, isolating one test from another. */
export async function resetDb(): Promise<void> {
  await getTestDb().delete(schema.users);
}

/** Closes the underlying pg pool and releases the in-memory instance. */
export async function closeDb(): Promise<void> {
  await pgPool?.end();
  pgPool = null;
  drizzleDb = null;
  memoryDb = null;
}
