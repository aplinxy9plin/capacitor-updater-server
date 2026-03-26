@AGENTS.md

## Project

Self-hosted Capacitor OTA bundle update server. Implements the `@capgo/capacitor-updater` plugin protocol.

## Stack

- Next.js 16 + React 19 (App Router) under `src/`
- Elysia (API framework) with TypeBox validation
- BetterAuth (authentication) with separate auth DB
- Bun SQL (`import { sql } from "bun"`) for queries
- Drizzle ORM for schema definitions + migrations only
- MinIO (S3-compatible storage)
- SWR for client-side data fetching
- shadcn/ui + Tailwind CSS 4
- Docker Compose for deployment

## Development

```bash
bun dev              # Start dev server
bun run build        # Production build
bun run lint         # Lint
bun run migrate      # Run all migrations (BetterAuth + Drizzle)
bunx drizzle-kit generate  # Generate migration after schema changes
```

## Architecture

API-first: the admin UI consumes the same REST API that the mobile plugin uses.

All API routes go through Elysia via a single catch-all: `src/app/api/[[...slugs]]/route.ts`

- **Elysia entry**: `src/elysia.ts` — registers all module routes + auth handler
- **Plugin endpoints**: `/api/update`, `/api/stats`, `/api/download/:id` (authenticated by `x-api-key` header)
- **Admin API**: `/api/v1/*` (authenticated by BetterAuth session)
- **Auth API**: `/api/auth/*` (handled by BetterAuth)
- **API docs**: `/api/docs` (Swagger/Scalar UI, auto-generated from TypeBox schemas)

### Module structure

Each feature is a module in `src/modules/{name}/`:
- `model.ts` — TypeBox schemas for request validation
- `service.ts` — Business logic with `import { sql } from "bun"` queries
- `routes.ts` — Elysia route definitions

### Key files

- `src/app.config.ts` — Centralized env var validation
- `src/lib/auth.ts` — BetterAuth server config
- `src/lib/auth-client.ts` — Client-side auth hooks
- `src/lib/auth-ensure-session.ts` — Session validation for Elysia routes
- `src/db/schema/*.ts` — Drizzle table definitions (one file per table)
- `src/lib/storage.ts` — MinIO S3 client

## Key Decisions

- API keys use SHA-256 (not bcrypt) — keys are long random strings
- Single active bundle enforced by partial unique index
- Version comparison uses exact string equality (not semver ordering)
- Bundle downloads require API key authentication
- BetterAuth uses a separate PostgreSQL database from the app
- Queries use `bun sql` template literals, not Drizzle query builder
- Frontend uses SWR with 30s refresh interval for real-time data
