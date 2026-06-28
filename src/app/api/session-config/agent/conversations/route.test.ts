import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GET, POST } from "./route";
import { GET as GET_DETAIL, PATCH as PATCH_DETAIL } from "./[conversationId]/route";
import { POST as POST_MESSAGE } from "./[conversationId]/messages/route";
import { PATCH as PATCH_PROPOSAL } from "./[conversationId]/proposals/[proposalId]/route";

function withoutDatabase<T>(run: () => Promise<T>): Promise<T> {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  return run().finally(() => {
    if (previous) process.env.DATABASE_URL = previous;
  });
}

test("GET /api/session-config/agent/conversations falls back without DATABASE_URL", async () => {
  await withoutDatabase(async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/session-config/agent/conversations?locale=en&dateKey=2026-06-27",
      ),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      databaseConfigured: false,
      conversations: [],
      current: null,
    });
  });
});

test("POST /api/session-config/agent/conversations creates no DB side effects without DATABASE_URL", async () => {
  await withoutDatabase(async () => {
    const response = await POST(
      new Request(
        "http://localhost/api/session-config/agent/conversations?locale=en&dateKey=2026-06-27",
        { method: "POST" },
      ),
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      databaseConfigured: false,
      conversation: null,
    });
  });
});

test("GET /api/session-config/agent/conversations/:id falls back without DATABASE_URL", async () => {
  await withoutDatabase(async () => {
    const response = await GET_DETAIL(
      new Request("http://localhost/api/session-config/agent/conversations/abc"),
      { params: { conversationId: "abc" } },
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      databaseConfigured: false,
      conversation: null,
    });
  });
});

test("PATCH /api/session-config/agent/conversations/:id archives safely and falls back without DATABASE_URL", async () => {
  await withoutDatabase(async () => {
    const invalid = await PATCH_DETAIL(
      new Request("http://localhost/api/session-config/agent/conversations/abc", {
        method: "PATCH",
        body: JSON.stringify({ status: "deleted" }),
      }),
      { params: { conversationId: "abc" } },
    );
    assert.equal(invalid.status, 400);

    const valid = await PATCH_DETAIL(
      new Request("http://localhost/api/session-config/agent/conversations/abc", {
        method: "PATCH",
        body: JSON.stringify({ status: "archived" }),
      }),
      { params: { conversationId: "abc" } },
    );
    const body = await valid.json();

    assert.equal(valid.status, 200);
    assert.deepEqual(body, {
      databaseConfigured: false,
      conversation: null,
    });
  });
});

test("POST /api/session-config/agent/conversations/:id/messages validates and falls back without DATABASE_URL", async () => {
  await withoutDatabase(async () => {
    const invalid = await POST_MESSAGE(
      new Request("http://localhost/api/session-config/agent/conversations/abc/messages", {
        method: "POST",
        body: JSON.stringify({ role: "tool", content: "unsafe" }),
      }),
      { params: { conversationId: "abc" } },
    );
    assert.equal(invalid.status, 400);

    const valid = await POST_MESSAGE(
      new Request("http://localhost/api/session-config/agent/conversations/abc/messages", {
        method: "POST",
        body: JSON.stringify({
          role: "assistant",
          kind: "ai",
          status: "success",
          content: "Config ready",
          proposal: { configText: '{ "version": 1 }' },
        }),
      }),
      { params: { conversationId: "abc" } },
    );
    const body = await valid.json();

    assert.equal(valid.status, 200);
    assert.deepEqual(body, {
      databaseConfigured: false,
      message: null,
    });
  });
});

test("PATCH /api/session-config/agent/conversations/:id/proposals/:proposalId marks reviewed only", async () => {
  await withoutDatabase(async () => {
    const invalid = await PATCH_PROPOSAL(
      new Request("http://localhost/api/session-config/agent/conversations/abc/proposals/p1", {
        method: "PATCH",
        body: JSON.stringify({ status: "applied" }),
      }),
      { params: { conversationId: "abc", proposalId: "p1" } },
    );
    assert.equal(invalid.status, 400);

    const valid = await PATCH_PROPOSAL(
      new Request("http://localhost/api/session-config/agent/conversations/abc/proposals/p1", {
        method: "PATCH",
        body: JSON.stringify({ status: "reviewed" }),
      }),
      { params: { conversationId: "abc", proposalId: "p1" } },
    );
    const body = await valid.json();

    assert.equal(valid.status, 200);
    assert.deepEqual(body, {
      databaseConfigured: false,
      proposal: null,
    });
  });
});

test("agent conversation routes wrap optional database calls and never accept client provider secrets", () => {
  const files = [
    "src/app/api/session-config/agent/conversations/route.ts",
    "src/app/api/session-config/agent/conversations/[conversationId]/route.ts",
    "src/app/api/session-config/agent/conversations/[conversationId]/messages/route.ts",
    "src/app/api/session-config/agent/conversations/[conversationId]/proposals/[proposalId]/route.ts",
  ];
  for (const file of files) {
    const source = readFileSync(resolve(file), "utf8");
    assert.match(source, /withOptionalDatabaseFallback/);
    assert.doesNotMatch(source, /apiKey|baseUrl|Authorization/i);
  }
});
