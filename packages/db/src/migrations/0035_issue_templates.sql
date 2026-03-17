-- Rollback:
--   DROP INDEX IF EXISTS "issue_templates_active_order_idx";
--   DROP TABLE IF EXISTS "issue_templates";

CREATE TABLE "issue_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"title_template" text NOT NULL,
	"description_template" text,
	"status" text NOT NULL DEFAULT 'backlog',
	"priority" text NOT NULL DEFAULT 'medium',
	"label_names" jsonb NOT NULL DEFAULT '[]'::jsonb,
	"display_order" integer NOT NULL DEFAULT 0,
	"is_active" boolean NOT NULL DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "issue_templates_active_order_idx" ON "issue_templates" USING btree ("is_active", "display_order");