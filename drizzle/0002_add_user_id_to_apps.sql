-- Add user ownership to apps table
ALTER TABLE apps ADD COLUMN user_id text;

-- Assign existing apps to the first user (the admin who created them)
UPDATE apps SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;

-- Make it non-nullable after backfill
ALTER TABLE apps ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE apps ADD CONSTRAINT apps_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Index for fast lookups by user
CREATE INDEX idx_apps_user_id ON apps (user_id);
