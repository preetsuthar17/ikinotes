ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "folders" DROP CONSTRAINT "folders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "folders_user_id_idx";--> statement-breakpoint
DROP INDEX "notes_user_id_idx";--> statement-breakpoint
DROP INDEX "notes_folder_id_idx";--> statement-breakpoint
DROP INDEX "notes_user_id_created_at_idx";--> statement-breakpoint
ALTER TABLE "folders" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "user_id" SET DATA TYPE text;