import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AGENT_CONVERSATION_FALLBACK,
  defaultAgentConversationTitle,
  deriveAgentConversationTitle,
  normalizeAgentMessageInput,
  normalizeAgentConversationPatch,
  normalizeAgentProposalPatch,
} from "./agent-conversation-repository";

test("agent conversation fallback mirrors optional local-only persistence", () => {
  assert.deepEqual(AGENT_CONVERSATION_FALLBACK, {
    databaseConfigured: false,
    conversations: [],
    current: null,
  });
});

test("defaultAgentConversationTitle is deterministic and date scoped", () => {
  assert.equal(defaultAgentConversationTitle("2026-06-27"), "Session Agent · 2026-06-27");
});

test("deriveAgentConversationTitle turns the first user brief into a short history title", () => {
  assert.equal(
    deriveAgentConversationTitle("  Tonight: React performance deep dive\ninclude flamegraphs", "2026-06-27"),
    "Tonight: React performance deep dive",
  );
  assert.equal(
    deriveAgentConversationTitle("x".repeat(96), "2026-06-27"),
    `${"x".repeat(61)}…`,
  );
  assert.equal(deriveAgentConversationTitle("", "2026-06-27"), "Session Agent · 2026-06-27");
});

test("normalizeAgentMessageInput accepts safe message fields and proposal drafts", () => {
  const normalized = normalizeAgentMessageInput({
    role: "assistant",
    kind: "ai",
    status: "success",
    content: "Here is a config",
    taskId: "generate",
    taskLabel: "Generate config",
    snapshot: "abc123",
    provider: "deepseek",
    model: "deepseek-chat",
    proposal: {
      configText: '{ "version": 1 }',
      summaryJson: { changes: ["title"] },
      status: "applied",
    },
  });

  assert.deepEqual(normalized, {
    role: "assistant",
    kind: "ai",
    status: "success",
    content: "Here is a config",
    taskId: "generate",
    taskLabel: "Generate config",
    snapshot: "abc123",
    provider: "deepseek",
    model: "deepseek-chat",
    proposal: {
      configText: '{ "version": 1 }',
      summaryJson: { changes: ["title"] },
      status: "draft",
    },
  });
});

test("normalizeAgentMessageInput rejects empty content and unsafe roles", () => {
  assert.equal(normalizeAgentMessageInput({ role: "tool", content: "x" }), null);
  assert.equal(normalizeAgentMessageInput({ role: "user", content: "" }), null);
});

test("conversation and proposal patches accept only safe lifecycle transitions", () => {
  assert.deepEqual(normalizeAgentConversationPatch({ status: "archived" }), { status: "archived" });
  assert.equal(normalizeAgentConversationPatch({ status: "deleted" }), null);
  assert.deepEqual(normalizeAgentProposalPatch({ status: "reviewed" }), { status: "reviewed" });
  assert.equal(normalizeAgentProposalPatch({ status: "applied" }), null);
});

test("agent conversation migration creates dedicated conversation, message and proposal tables", () => {
  const sql = readFileSync(resolve("drizzle/0002_agent_conversations.sql"), "utf8");

  assert.match(sql, /CREATE TABLE IF NOT EXISTS "agent_conversations"/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS "agent_messages"/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS "agent_proposals"/);
  assert.match(sql, /SELECT 1 FROM pg_constraint WHERE conname = 'agent_messages_conversation_id_agent_conversations_id_fk'/);
  assert.match(sql, /FOREIGN KEY \("conversation_id"\) REFERENCES "agent_conversations"\("id"\)/);
  assert.match(sql, /FOREIGN KEY \("message_id"\) REFERENCES "agent_messages"\("id"\)/);
});

test("current conversation is always included in the returned history list", () => {
  const source = readFileSync(resolve("src/db/agent-conversation-repository.ts"), "utf8");

  assert.match(source, /const listRows = conversations\.some/);
  assert.match(source, /\[currentRow, \.\.\.conversations\]/);
  assert.match(source, /conversations: listRows\.map\(rowToSummary\)/);
});

test("agent conversation history excludes archived conversations", () => {
  const source = readFileSync(resolve("src/db/agent-conversation-repository.ts"), "utf8");

  assert.match(source, /eq\(agentConversations\.status,\s*"active"\)/);
});
