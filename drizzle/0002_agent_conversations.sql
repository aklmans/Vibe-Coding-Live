CREATE TABLE IF NOT EXISTS "agent_conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "date_key" varchar(10) NOT NULL,
  "locale" varchar(2) NOT NULL,
  "live_session_id" uuid,
  "title" text NOT NULL,
  "status" varchar(16) DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "agent_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" uuid NOT NULL,
  "role" varchar(16) NOT NULL,
  "kind" varchar(16),
  "status" varchar(16),
  "content" text NOT NULL,
  "task_id" varchar(32),
  "task_label" text,
  "snapshot" varchar(64),
  "provider" varchar(64),
  "model" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "agent_proposals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" uuid NOT NULL,
  "message_id" uuid NOT NULL,
  "config_text" text NOT NULL,
  "summary_json" jsonb,
  "status" varchar(16) DEFAULT 'draft' NOT NULL,
  "applied_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "agent_conversations_date_locale_idx"
  ON "agent_conversations" ("date_key", "locale");

CREATE INDEX IF NOT EXISTS "agent_conversations_updated_at_idx"
  ON "agent_conversations" ("updated_at");

CREATE INDEX IF NOT EXISTS "agent_messages_conversation_created_idx"
  ON "agent_messages" ("conversation_id", "created_at");

CREATE INDEX IF NOT EXISTS "agent_proposals_conversation_idx"
  ON "agent_proposals" ("conversation_id");

CREATE INDEX IF NOT EXISTS "agent_proposals_message_idx"
  ON "agent_proposals" ("message_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agent_conversations_live_session_id_live_sessions_id_fk'
  ) THEN
    ALTER TABLE "agent_conversations"
      ADD CONSTRAINT "agent_conversations_live_session_id_live_sessions_id_fk"
      FOREIGN KEY ("live_session_id") REFERENCES "live_sessions"("id")
      ON DELETE set null;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agent_messages_conversation_id_agent_conversations_id_fk'
  ) THEN
    ALTER TABLE "agent_messages"
      ADD CONSTRAINT "agent_messages_conversation_id_agent_conversations_id_fk"
      FOREIGN KEY ("conversation_id") REFERENCES "agent_conversations"("id")
      ON DELETE cascade;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agent_proposals_conversation_id_agent_conversations_id_fk'
  ) THEN
    ALTER TABLE "agent_proposals"
      ADD CONSTRAINT "agent_proposals_conversation_id_agent_conversations_id_fk"
      FOREIGN KEY ("conversation_id") REFERENCES "agent_conversations"("id")
      ON DELETE cascade;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agent_proposals_message_id_agent_messages_id_fk'
  ) THEN
    ALTER TABLE "agent_proposals"
      ADD CONSTRAINT "agent_proposals_message_id_agent_messages_id_fk"
      FOREIGN KEY ("message_id") REFERENCES "agent_messages"("id")
      ON DELETE cascade;
  END IF;
END $$;
