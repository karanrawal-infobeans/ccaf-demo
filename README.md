# ccaf-demo

A shopping website clone built with Next.js (App Router), React 19, and
PostgreSQL via Drizzle ORM. It provides two frontend route trees:

- `/` — customer/end-user routes (home, login, registration)
- `/system` — backoffice routes (dashboard, login, registration)

## Stack

- **Framework**: Next.js 16 + React 19 (TypeScript)
- **Database**: PostgreSQL 17 (Docker Compose)
- **ORM**: Drizzle ORM (schema-as-code in `lib/db/schema.ts`)
- **Validation**: zod
- **Testing**: Jest + ts-jest with an in-memory Postgres (pg-mem) — no live
  database is required to run tests
- **Logging**: pino

## Prerequisites

- Node.js 18.17+
- Docker (for the local PostgreSQL via Compose)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and adjust values as needed:

   ```bash
   cp env.example .env
   ```

3. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

4. Apply the database schema:

   ```bash
   npm run db:push
   ```

   > For an auditable migration history instead of a direct push, use
   > `npm run db:generate` then `npm run db:migrate`.

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Scripts

| Command                           | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| `npm run dev` / `build` / `start` | Next.js dev server / production build / start          |
| `npm test`                        | Run the Jest test suite (uses in-memory Postgres)      |
| `npm run lint`                    | ESLint + Prettier checks                               |
| `npm run format`                  | Auto-format with Prettier                              |
| `npm run db:push`                 | Push the Drizzle schema to the database directly (dev) |
| `npm run db:generate`             | Generate a migration file from schema changes          |
| `npm run db:migrate`              | Apply pending migrations                               |

## Environment Variables

See `env.example`. Notable keys:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — signing secret for auth tokens
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — Docker Compose DB config
- `LOG_LEVEL` — pino log level

## Architecture

Follows a layered backend (Routes → Service → Repository → Drizzle) with
dependency injection:

- `app/api/**` — Next.js route handlers, wrapped by `withApiHandler`
- `lib/auth/` — auth service, repository, JWT helpers, zod DTOs
- `lib/db/` — Drizzle schema (`schema.ts`) and client (`index.ts`)
- `test/db.ts` — in-memory Postgres (pg-mem) for tests
