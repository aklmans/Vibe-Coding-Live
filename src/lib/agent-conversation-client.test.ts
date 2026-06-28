import test from "node:test";
import assert from "node:assert/strict";
import {
  archiveAgentConversationClient,
  appendAgentConversationMessage,
  createAgentConversationClient,
  fetchAgentConversation,
  fetchAgentConversations,
  markAgentProposalReviewedClient,
} from "./agent-conversation-client";

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response;
}

test("fetchAgentConversations requests the date-scoped conversation list", async () => {
  const calls: string[] = [];
  const result = await fetchAgentConversations("zh", "2026-06-27", async (url) => {
    calls.push(String(url));
    return jsonResponse({ databaseConfigured: true, conversations: [], current: null });
  });

  assert.equal(
    calls[0],
    "/api/session-config/agent/conversations?locale=zh&dateKey=2026-06-27",
  );
  assert.deepEqual(result, {
    databaseConfigured: true,
    conversations: [],
    current: null,
  });
});

test("conversation client maps request failures to local fallback results", async () => {
  const failingFetch = async () => {
    throw new Error("network down");
  };

  assert.deepEqual(await fetchAgentConversations("en", "2026-06-27", failingFetch), {
    databaseConfigured: false,
    conversations: [],
    current: null,
  });
  assert.deepEqual(await fetchAgentConversation("abc", failingFetch), {
    databaseConfigured: false,
    conversation: null,
  });
  assert.deepEqual(await createAgentConversationClient("en", "2026-06-27", failingFetch), {
    databaseConfigured: false,
    conversation: null,
  });
  assert.deepEqual(
    await appendAgentConversationMessage("abc", { role: "user", content: "hello" }, failingFetch),
    {
      databaseConfigured: false,
      message: null,
    },
  );
});

test("appendAgentConversationMessage posts normalized message payloads to the conversation", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const response = await appendAgentConversationMessage(
    "abc",
    {
      role: "assistant",
      kind: "ai",
      status: "success",
      content: "Config ready",
      proposal: { configText: '{ "version": 1 }' },
    },
    async (url, init) => {
      calls.push({ url: String(url), init: init ?? {} });
      return jsonResponse({ databaseConfigured: true, message: null });
    },
  );

  assert.equal(calls[0]?.url, "/api/session-config/agent/conversations/abc/messages");
  assert.equal(calls[0]?.init.method, "POST");
  assert.equal(calls[0]?.init.headers && (calls[0].init.headers as Record<string, string>)["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(String(calls[0]?.init.body)), {
    role: "assistant",
    kind: "ai",
    status: "success",
    content: "Config ready",
    proposal: { configText: '{ "version": 1 }' },
  });
  assert.deepEqual(response, { databaseConfigured: true, message: null });
});

test("archiveAgentConversationClient patches a conversation without sending provider data", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const response = await archiveAgentConversationClient("abc", async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return jsonResponse({ databaseConfigured: true, conversation: null });
  });

  assert.equal(calls[0]?.url, "/api/session-config/agent/conversations/abc");
  assert.equal(calls[0]?.init.method, "PATCH");
  assert.deepEqual(JSON.parse(String(calls[0]?.init.body)), { status: "archived" });
  assert.doesNotMatch(String(calls[0]?.init.body), /apiKey|baseUrl|Authorization/i);
  assert.deepEqual(response, { databaseConfigured: true, conversation: null });
});

test("markAgentProposalReviewedClient patches only the proposal lifecycle status", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const response = await markAgentProposalReviewedClient("abc", "proposal-1", async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return jsonResponse({ databaseConfigured: true, proposal: null });
  });

  assert.equal(calls[0]?.url, "/api/session-config/agent/conversations/abc/proposals/proposal-1");
  assert.equal(calls[0]?.init.method, "PATCH");
  assert.deepEqual(JSON.parse(String(calls[0]?.init.body)), { status: "reviewed" });
  assert.deepEqual(response, { databaseConfigured: true, proposal: null });
});
