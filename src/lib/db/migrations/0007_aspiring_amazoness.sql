ALTER TABLE "session_metadata" ADD COLUMN "cf_data_center" varchar(10);--> statement-breakpoint
ALTER TABLE "session_metadata" ADD COLUMN "cf_ray" varchar(50);--> statement-breakpoint
ALTER TABLE "session_metadata" ADD COLUMN "is_secure_connection" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "session_metadata" ADD COLUMN "using_cloudflare_warp" boolean DEFAULT false;