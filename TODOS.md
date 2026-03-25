# TODOS

## P1 — High Priority

### Channels (v2)
Per-channel active versions enabling staging/production separation, beta testing groups, and gradual rollouts. The single-active-version model in v1 works for solo use but is a footgun for multi-developer teams. Channels are the #1 feature needed to make this a real team tool.

- **Effort:** L (human) / M (CC: ~30-45 min)
- **Depends on:** v1 shipped + stable plugin protocol
- **Context:** The `@capgo/capacitor-updater` plugin already supports a channel endpoint (`POST /api/channel`). The schema needs a `channels` table with `active_version_id` FK to `bundles`, and the `/api/update` handler needs to resolve the device's channel before looking up the active bundle.

## P2 — Medium Priority

### CLI Upload Tool
Node CLI (`npx cap-updater upload ./dist.zip --version 1.4.3 --server URL --key sk_xxx`) for CI/CD pipeline deploys. Calls the admin API to create + upload bundles without the web UI.

- **Effort:** M (human) / S (CC: ~15-20 min)
- **Depends on:** Working admin API (v1)
- **Context:** The API-first architecture means this is a thin HTTP client. Two API calls: `POST /api/v1/bundles` (create metadata) → `POST /api/v1/bundles/:id/upload` (stream zip). Consider publishing as `@cap-updater/cli` on npm.

### GitHub Actions Integration
GitHub Action that wraps the CLI tool for automated bundle deploys on push/tag.

- **Effort:** S (human) / S (CC: ~10 min)
- **Depends on:** CLI Upload Tool
- **Context:** Once the CLI exists, the Action is a thin wrapper with inputs for server URL, API key (from secrets), version, and zip path.
