---
name: backend-development
description: Skill to use while working on backend related tasks. It has guidelines/instructions/conventions for backend development.
---

## When to use

- Use this skill to work only on backend tasks.

## When not to use

- Do not use this skill to work on frontend tasks.

## Conventions and Guidelines

### General Backend Development Guidelines

- Follow the standard backend architecture with service and repository layer with dependency injection.

### Database

- The project uses PostgreSQL (see Docker Compose) and interacts with it via Drizzle ORM.
- Schema lives in `lib/db/schema.ts`; the client is in `lib/db/index.ts`.
- Tests use an in-memory Postgres via pg-mem (see `test/db.ts`) — never mock the database for integration-style tests.

### MCP

- Currently no guidelines for writing mcp.
