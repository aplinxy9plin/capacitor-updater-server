# Capacitor Updater Server

Self-hosted OTA (Over-The-Air) update server for [Capacitor](https://capacitorjs.com/) apps. Drop-in replacement for [Capgo](https://capgo.app/) cloud — deploy on your own infrastructure with full control over your update pipeline.

Implements the [`@capgo/capacitor-updater`](https://github.com/Cap-go/capacitor-updater) plugin protocol.

## Features

- **OTA Updates** — Push web bundle updates to your Capacitor apps without App Store review
- **Instant Updates** — `directUpdate` support applies updates immediately on first launch
- **Multi-App Support** — Manage multiple apps from a single dashboard
- **Bundle Management** — Upload, version, and activate bundles with one click
- **Device Tracking** — See which devices are running which version
- **Analytics** — Update success rates, version distribution, device stats
- **API Key Auth** — Secure the admin dashboard and stats reporting with API keys
- **Interactive API Docs** — Auto-generated Swagger/Scalar documentation at `/api/docs`
- **Single Active Bundle** — Database-enforced constraint ensures exactly one active bundle per app
- **Dark Mode** — Full light/dark theme support

## Stack

- [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) (App Router)
- [Elysia](https://elysiajs.com/) (API framework with TypeBox validation)
- [BetterAuth](https://www.better-auth.com/) (authentication)
- [Bun SQL](https://bun.sh/docs/api/sql) (PostgreSQL queries)
- [Drizzle ORM](https://orm.drizzle.team/) (schema & migrations)
- [MinIO](https://min.io/) (S3-compatible bundle storage)
- [SWR](https://swr.vercel.app/) (client-side data fetching)
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS 4](https://tailwindcss.com/)

## Quick Start

### Docker Compose (recommended)

```bash
git clone https://github.com/AplyQ/capacitor-updater-server.git
cd capacitor-updater-server
docker compose up
```

Open [http://localhost:3000](http://localhost:3000) — registration is enabled by default for the first user.

### Manual Setup

Prerequisites: [Bun](https://bun.sh/), PostgreSQL, MinIO (or any S3-compatible storage).

```bash
# Install dependencies
bun install

# Copy and configure environment
cp .env.example .env
# Edit .env with your database URLs, MinIO credentials, etc.

# Run migrations
bun run migrate

# Start dev server
bun dev
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection for app data | `postgres://user:pass@localhost:5432/updater` |
| `BETTER_AUTH_DATABASE_URL` | PostgreSQL connection for auth data | `postgres://user:pass@localhost:5432/auth` |
| `BETTER_AUTH_SECRET` | Secret key for session signing | Random 32+ char string |
| `BETTER_AUTH_URL` | Public URL of your server | `https://updates.example.com` |
| `MINIO_ENDPOINT` | MinIO/S3 hostname | `localhost` |
| `MINIO_PORT` | MinIO/S3 port | `9000` |
| `MINIO_ACCESS_KEY` | MinIO/S3 access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO/S3 secret key | `minioadmin` |
| `ALLOW_REGISTRATION` | Enable user registration on first run | `true` |

## Capacitor App Setup

### 1. Install the plugin

```bash
npm install @capgo/capacitor-updater
```

### 2. Configure `capacitor.config.ts`

```ts
const config: CapacitorConfig = {
  appId: 'com.example.myapp',
  plugins: {
    CapacitorUpdater: {
      updateUrl: 'https://your-server.com/api/update',
      statsUrl: 'https://your-server.com/api/stats',
      autoUpdate: true,
      directUpdate: true,
    },
  },
};
```

| Option | Description |
|--------|-------------|
| `updateUrl` | Your server's update endpoint |
| `statsUrl` | Your server's stats endpoint |
| `autoUpdate` | Enable automatic update checks (default: `true`) |
| `directUpdate` | Apply updates immediately after download instead of waiting for app restart. Users will see a brief WebView reload. |

### 3. Notify the plugin on app ready

```ts
import { CapacitorUpdater } from '@capgo/capacitor-updater';

CapacitorUpdater.notifyAppReady();
```

This tells the plugin that the update loaded successfully. Without this call, the plugin will roll back to the previous version after a timeout.

### 4. Upload a bundle

Build your web assets, zip them, and upload through the dashboard.

```bash
npm run build && npx cap sync
cd dist && zip -r ../bundle.zip . && cd ..
```

Then go to your app in the dashboard, click **Upload Bundle**, enter the version, and activate it.

### How updates work

1. App launches → plugin calls `/api/update` with current `version_name`
2. Server compares with active bundle version (exact string match, not semver)
3. If different → returns download URL
4. Plugin downloads the zip in the background
5. With `directUpdate: true` → WebView reloads immediately with new bundle
6. Without `directUpdate` → update applies on next app restart

## API

Plugin endpoints (`/api/update`, `/api/download`) are **public** — no API key required. The `@capgo/capacitor-updater` plugin does not send custom headers on these requests.

API keys are used for **stats reporting** (`/api/stats`) and the **admin dashboard**. Create them in the dashboard under API Keys.

### Plugin Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/update` | None | Check for updates (rate limited by app_id) |
| `GET` | `/api/download/:bundleId` | None | Download bundle zip (bundle UUID is unguessable) |
| `POST` | `/api/stats` | `x-api-key` header | Report update status |
| `GET` | `/api/health` | None | Health check |

### Admin Endpoints

All admin endpoints require a BetterAuth session cookie (login via the dashboard).

| Method | Path | Description |
|--------|------|-------------|
| `GET/POST` | `/api/v1/apps` | List / create apps |
| `GET/DELETE` | `/api/v1/apps/:id` | Get / delete app |
| `GET/POST` | `/api/v1/apps/:id/bundles` | List / create bundles |
| `DELETE` | `/api/v1/apps/:id/bundles/:bundleId` | Delete bundle |
| `POST` | `/api/v1/apps/:id/bundles/:bundleId/upload` | Upload bundle zip |
| `POST` | `/api/v1/apps/:id/bundles/:bundleId/activate` | Activate bundle |
| `GET/POST/DELETE` | `/api/v1/api-keys` | Manage API keys |
| `GET` | `/api/v1/devices` | List devices |
| `GET` | `/api/v1/analytics` | Get analytics |
| `GET/PUT` | `/api/v1/settings` | Get / update settings |

Full interactive docs available at `/api/docs` when the server is running.

## Architecture

```
src/
├── app/                    # Next.js pages & layouts
├── components/             # React components (shadcn/ui)
├── db/schema/              # Drizzle table definitions
├── modules/                # Elysia API modules
│   ├── plugin/             #   Mobile plugin endpoints
│   ├── apps/               #   App CRUD
│   ├── bundles/            #   Bundle management
│   ├── api-keys/           #   API key management
│   ├── devices/            #   Device listing
│   ├── analytics/          #   Analytics queries
│   └── settings/           #   Settings management
├── lib/                    # Auth, storage, utilities
├── app.config.ts           # Centralized env config
└── elysia.ts               # API entry point
```

All API routes go through a single Elysia instance via `src/app/api/[[...slugs]]/route.ts`.

## Production Deployment

For production, make sure to:

1. Set strong values for `BETTER_AUTH_SECRET` and MinIO credentials
2. Use separate PostgreSQL instances or databases for app and auth data
3. Put a reverse proxy (nginx/Caddy) in front with SSL
4. Set `BETTER_AUTH_URL` to your public domain
5. Disable registration after creating your admin account (via Settings page)

## License

[MIT](LICENSE)
