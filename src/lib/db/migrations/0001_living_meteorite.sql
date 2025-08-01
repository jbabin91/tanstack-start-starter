CREATE TYPE "public"."activity_type" AS ENUM('login', 'logout', 'page_view', 'api_request', 'security_event', 'error');--> statement-breakpoint
CREATE TYPE "public"."connection_type" AS ENUM('wifi', 'cellular', 'ethernet', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('mobile', 'desktop', 'tablet', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."trust_level" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TABLE "session_activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"activity_details" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"request_path" text,
	"http_method" varchar(10),
	"response_status" integer,
	"response_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_metadata" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"device_fingerprint" varchar(64) NOT NULL,
	"device_type" "device_type" DEFAULT 'unknown' NOT NULL,
	"device_name" varchar(255),
	"browser_name" varchar(100),
	"browser_version" varchar(50),
	"os_name" varchar(100),
	"os_version" varchar(50),
	"is_mobile" boolean DEFAULT false NOT NULL,
	"country_code" varchar(2),
	"region" varchar(100),
	"city" varchar(100),
	"timezone" varchar(50),
	"isp_name" varchar(200),
	"connection_type" "connection_type" DEFAULT 'unknown',
	"security_score" integer DEFAULT 50 NOT NULL,
	"is_trusted_device" boolean DEFAULT false NOT NULL,
	"trust_factors" jsonb,
	"suspicious_activity_count" integer DEFAULT 0 NOT NULL,
	"last_security_check" timestamp with time zone,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"page_views_count" integer DEFAULT 0 NOT NULL,
	"requests_count" integer DEFAULT 0 NOT NULL,
	"last_page_visited" text,
	"session_duration_seconds" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_metadata_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "trusted_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"device_fingerprint" varchar(64) NOT NULL,
	"device_name" varchar(255) NOT NULL,
	"device_type" "device_type" NOT NULL,
	"trust_level" "trust_level" DEFAULT 'medium' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"trusted_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"created_by_session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trusted_devices_user_device_unique" UNIQUE("user_id","device_fingerprint")
);
--> statement-breakpoint
ALTER TABLE "session_activity_log" ADD CONSTRAINT "session_activity_log_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_activity_log" ADD CONSTRAINT "session_activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_metadata" ADD CONSTRAINT "session_metadata_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_created_by_session_id_sessions_id_fk" FOREIGN KEY ("created_by_session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_activity_log_session_created_idx" ON "session_activity_log" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "session_activity_log_user_created_idx" ON "session_activity_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "session_activity_log_activity_created_idx" ON "session_activity_log" USING btree ("activity_type","created_at");--> statement-breakpoint
CREATE INDEX "session_activity_log_created_at_idx" ON "session_activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "session_activity_log_ip_address_idx" ON "session_activity_log" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "session_activity_log_user_activity_idx" ON "session_activity_log" USING btree ("user_id","activity_type","created_at");--> statement-breakpoint
CREATE INDEX "session_activity_log_session_activity_idx" ON "session_activity_log" USING btree ("session_id","activity_type");--> statement-breakpoint
CREATE INDEX "session_metadata_session_id_idx" ON "session_metadata" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_metadata_device_fingerprint_idx" ON "session_metadata" USING btree ("device_fingerprint");--> statement-breakpoint
CREATE INDEX "session_metadata_security_score_idx" ON "session_metadata" USING btree ("security_score");--> statement-breakpoint
CREATE INDEX "session_metadata_last_activity_idx" ON "session_metadata" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "session_metadata_created_at_idx" ON "session_metadata" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "trusted_devices_user_id_active_idx" ON "trusted_devices" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "trusted_devices_device_fingerprint_idx" ON "trusted_devices" USING btree ("device_fingerprint");--> statement-breakpoint
CREATE INDEX "trusted_devices_expires_at_idx" ON "trusted_devices" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "trusted_devices_last_seen_at_idx" ON "trusted_devices" USING btree ("last_seen_at");