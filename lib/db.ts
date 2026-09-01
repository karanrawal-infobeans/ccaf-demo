/**
 * Singleton PrismaClient.
 * In development, reuses the global instance across Next.js hot-reloads.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  return new PrismaClient();
}

const db: PrismaClient = global.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = db;
}

export default db;
