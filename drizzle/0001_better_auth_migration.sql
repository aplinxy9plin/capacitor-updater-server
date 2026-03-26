-- Drop FK constraint on api_keys.user_id first
ALTER TABLE "api_keys" DROP CONSTRAINT IF EXISTS "api_keys_user_id_users_id_fk";
--> statement-breakpoint
-- Drop old columns from users table
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "created_at";
--> statement-breakpoint
-- Change users.id from uuid to text
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;
--> statement-breakpoint
-- Change api_keys.user_id from uuid to text
ALTER TABLE "api_keys" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text;
--> statement-breakpoint
-- Re-add FK constraint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
