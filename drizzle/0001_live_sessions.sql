CREATE TABLE IF NOT EXISTS "live_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "date_key" varchar(10) NOT NULL,
  "locale" varchar(2) NOT NULL,
  "title" text NOT NULL,
  "status" varchar(16) DEFAULT 'draft' NOT NULL,
  "active_section" integer DEFAULT 0 NOT NULL,
  "bottom_bar_visible" boolean DEFAULT true NOT NULL,
  "started_at" timestamp with time zone,
  "ended_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "live_sections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "sort_order" integer NOT NULL,
  "title" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "live_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "section_id" uuid NOT NULL,
  "sort_order" integer NOT NULL,
  "text" text NOT NULL,
  "done" boolean DEFAULT false NOT NULL,
  "done_at" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "live_stack_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "sort_order" integer NOT NULL,
  "label" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "live_bottom_bar_segments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL,
  "sort_order" integer NOT NULL,
  "kind" varchar(24) NOT NULL,
  "section_index" integer,
  "title" text,
  "text" text
);

CREATE UNIQUE INDEX IF NOT EXISTS "live_sessions_date_locale_unique"
  ON "live_sessions" ("date_key", "locale");

ALTER TABLE "live_sections"
  ADD CONSTRAINT "live_sections_session_id_live_sessions_id_fk"
  FOREIGN KEY ("session_id") REFERENCES "live_sessions"("id")
  ON DELETE cascade;

ALTER TABLE "live_tasks"
  ADD CONSTRAINT "live_tasks_section_id_live_sections_id_fk"
  FOREIGN KEY ("section_id") REFERENCES "live_sections"("id")
  ON DELETE cascade;

ALTER TABLE "live_stack_items"
  ADD CONSTRAINT "live_stack_items_session_id_live_sessions_id_fk"
  FOREIGN KEY ("session_id") REFERENCES "live_sessions"("id")
  ON DELETE cascade;

ALTER TABLE "live_bottom_bar_segments"
  ADD CONSTRAINT "live_bottom_bar_segments_session_id_live_sessions_id_fk"
  FOREIGN KEY ("session_id") REFERENCES "live_sessions"("id")
  ON DELETE cascade;
