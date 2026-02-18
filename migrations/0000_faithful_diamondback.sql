CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_id" integer,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"amount" real NOT NULL,
	"currency" text DEFAULT 'SAR' NOT NULL,
	"renewal_date" timestamp NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"logo_color" text DEFAULT '#5B6CF8' NOT NULL,
	"is_trial" boolean DEFAULT false NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"merchant" text,
	"email_from" text,
	"email_subject" text,
	"email_snippet" text,
	"confidence" integer DEFAULT 90 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sync_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"total_emails" integer DEFAULT 0 NOT NULL,
	"processed_emails" integer DEFAULT 0 NOT NULL,
	"found_subscriptions" integer DEFAULT 0 NOT NULL,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sync_status_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"provider" text DEFAULT 'google' NOT NULL,
	"language" text DEFAULT 'ar' NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"notify_days_before" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
