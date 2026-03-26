import { sql } from "bun"

export async function authEnsureSession<
  TSession extends { user: { id: string } },
>(
  headers: Headers,
  getSession: (opts: { headers: Headers }) => Promise<TSession | null>,
): Promise<TSession> {
  const session = await getSession({ headers })
  if (session == null) {
    throw new Error("Unauthorized")
  }
  // Ensure user exists in app DB (handles missed syncs)
  await ensureUserInAppDb(session.user.id)
  return session
}

export async function ensureUserInAppDb(userId: string): Promise<void> {
  try {
    await sql`
      INSERT INTO users (id)
      VALUES (${userId})
      ON CONFLICT (id) DO NOTHING
    `
  } catch (err) {
    throw new Error("Failed to sync user to app database", { cause: err })
  }
}
