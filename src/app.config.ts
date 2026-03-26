import "dotenv/config"

function env(key: string): string {
  return process.env[key] ?? ""
}

export const appConfig = {
  get DATABASE_URL() { return env("DATABASE_URL") },
  get BETTER_AUTH_SECRET() { return env("BETTER_AUTH_SECRET") },
  get BETTER_AUTH_URL() { return env("BETTER_AUTH_URL") },
  get BETTER_AUTH_DATABASE_URL() { return env("BETTER_AUTH_DATABASE_URL") },
  get MINIO_ENDPOINT() { return env("MINIO_ENDPOINT") },
  get MINIO_PORT() { return env("MINIO_PORT") },
  get MINIO_ACCESS_KEY() { return env("MINIO_ACCESS_KEY") },
  get MINIO_SECRET_KEY() { return env("MINIO_SECRET_KEY") },
}
