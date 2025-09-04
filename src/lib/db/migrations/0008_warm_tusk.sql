CREATE TABLE "rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text,
	"count" integer,
	"last_request" bigint
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "banned" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("key");--> statement-breakpoint
CREATE INDEX "rate_limits_last_request_idx" ON "rate_limits" USING btree ("last_request");