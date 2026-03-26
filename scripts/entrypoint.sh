#!/bin/sh
set -e

echo "[entrypoint] Waiting for PostgreSQL (app DB)..."
until pg_isready -h "${PGHOST:-db}" -p "${PGPORT:-5432}" -U "${PGUSER:-user}" -q 2>/dev/null; do
  sleep 1
done
echo "[entrypoint] App DB is ready."

echo "[entrypoint] Waiting for PostgreSQL (auth DB)..."
until pg_isready -h "auth-db" -p "5432" -U "user" -q 2>/dev/null; do
  sleep 1
done
echo "[entrypoint] Auth DB is ready."

echo "[entrypoint] Waiting for MinIO..."
MINIO_HOST="${MINIO_ENDPOINT:-minio}"
MINIO_P="${MINIO_PORT:-9000}"
RETRIES=0
until wget -q --spider "http://${MINIO_HOST}:${MINIO_P}/minio/health/live" 2>/dev/null || [ $RETRIES -ge 30 ]; do
  RETRIES=$((RETRIES + 1))
  sleep 1
done
echo "[entrypoint] MinIO is ready."

echo "[entrypoint] Running BetterAuth migrations..."
bun scripts/migrate-auth.mjs

echo "[entrypoint] Running app database migrations..."
bun scripts/migrate.mjs

echo "[entrypoint] Seeding settings..."
bun scripts/seed.mjs

echo "[entrypoint] Ensuring MinIO bucket..."
bun scripts/ensure-bucket.mjs

echo "[entrypoint] Starting server..."
exec bun server.js
