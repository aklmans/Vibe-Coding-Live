import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "../../hooks/useLocale";
import { DEFAULT_STATE } from "../../types";
import { buildAgentPrompt } from "../../lib/agent-prompt";
import LiveDataManager from "./LiveDataManager";

type Persistence = Parameters<typeof LiveDataManager>[0]["persistence"];

const BASE_PERSISTENCE: Persistence = {
  databaseConfigured: false,
  loading: false,
  saving: false,
  error: null,
  savedAt: null,
  session: null,
};

function renderCenter(persistence: Partial<Persistence> = {}) {
  return renderToStaticMarkup(
    React.createElement(LocaleProvider, {
      initialLocale: "en",
      persist: false,
      children: React.createElement(LiveDataManager, {
        state: DEFAULT_STATE,
        onChange: () => {},
        dateKey: "2026-06-25",
        persistence: { ...BASE_PERSISTENCE, ...persistence },
        onReload: () => {},
        onStartSession: () => {},
        onEndSession: () => {},
      }),
    }),
  );
}

test("the config center exposes three core views: prepare, form, json", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="config-view-prepare"/);
  assert.match(html, /data-testid="config-view-form"/);
  assert.match(html, /data-testid="config-view-json"/);
  // The outline switches between them.
  assert.match(html, /data-testid="config-outline"/);
  assert.match(html, /data-testid="config-nav-prepare"/);
  assert.match(html, /data-testid="config-nav-form"/);
  assert.match(html, /data-testid="config-nav-json"/);
});

test("the form view keeps the sections / live session / stack / bottom bar editors", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="config-view-form"/);
  assert.match(html, /data-testid="live-data-sections"/);
  assert.match(html, /data-testid="live-data-live-session"/);
  assert.match(html, /data-testid="live-data-stack"/);
  assert.match(html, /data-testid="live-data-bottom-bar"/);
});

test("the JSON view keeps SessionConfigEditor and its drift entry", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="config-view-json"/);
  assert.match(html, /data-testid="session-config-panel"/);
  assert.match(html, /data-testid="config-input"/);
  assert.match(html, /data-testid="config-apply"/);
  // The Synced/Editing mode chip is the drift entry point.
  assert.match(html, /data-testid="config-mode"/);
});

test("the source-of-truth bar shows DB / local status without a faked OBS revision", () => {
  const local = renderCenter();
  assert.match(local, /data-testid="live-data-session-bar"/);
  assert.match(local, /Authority/);
  assert.match(local, /Local draft/);
  // No DATABASE_URL → local-draft status (chip + full sentence tooltip).
  assert.match(local, /Local only/);
  assert.match(local, /Using local draft/i);
  // OBS chip is a current-state mirror — never an invented revision number.
  assert.match(local, /current state/);
  assert.doesNotMatch(local, /rev#?\s*\d+/i);
  assert.doesNotMatch(local, /revision\s*\d+/i);

  // A DB-saved session reflects honestly, too.
  const saved = renderCenter({
    databaseConfigured: true,
    savedAt: "2026-06-25T12:04:00Z",
    session: { status: "live", title: "Building With Agents" },
  });
  assert.match(saved, /Saved/);
  assert.doesNotMatch(saved, /rev#?\s*\d+/i);
});

test("AI prepare composes a handoff prompt — no Recipe/Brief, no LLM, no network", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="agent-prepare"/);
  assert.match(html, /data-testid="agent-brief-input"/);
  assert.match(html, /data-testid="agent-copy-prompt"/);
  assert.match(html, /data-testid="agent-open-json"/);
  // No revived legacy concepts.
  assert.doesNotMatch(html, /Recipe/i);
  assert.doesNotMatch(html, /Brief Builder|Quick Start|Stream Recipe/);

  // The prompt is pure local string composition over the current config.
  const prompt = buildAgentPrompt(DEFAULT_STATE, "test brief");
  assert.match(prompt, /live-session\.config\.json/);
  assert.match(prompt, /version: 1/);
  assert.match(prompt, /Brief: test brief/);
  assert.match(prompt, /Do NOT include runtime fields/);

  // No network / LLM calls in the prepare view or its prompt builder.
  const viewSrc = readFileSync(
    resolve("src/components/live-data/AgentPrepareView.tsx"),
    "utf8",
  );
  const promptSrc = readFileSync(resolve("src/lib/agent-prompt.ts"), "utf8");
  for (const src of [viewSrc, promptSrc]) {
    assert.doesNotMatch(src, /\bfetch\s*\(/);
    assert.doesNotMatch(src, /EventSource|XMLHttpRequest|openai|anthropic/i);
  }
});
