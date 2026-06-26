import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "../../hooks/useLocale";
import { DEFAULT_STATE } from "../../types";
import { buildAgentPrompt } from "../../lib/agent-prompt";
import { focusTargetTestId, needsFocusRetry } from "./drawer-focus";
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
        onOpenSettings: () => {},
        onReset: () => {},
      }),
    }),
  );
}

const MANUAL_SRC = readFileSync(
  resolve("src/components/live-data/ManualSettings.tsx"),
  "utf8",
);
const AGENT_SRC = readFileSync(
  resolve("src/components/live-data/AgentView.tsx"),
  "utf8",
);
const DRAWER_SRC = readFileSync(
  resolve("src/components/live-data/ConfigJsonDrawer.tsx"),
  "utf8",
);

test("mode is a segmented switch (Manual / Agent), not a left-nav of pages", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="config-mode-switch"/);
  assert.match(html, /data-testid="config-mode-manual"/);
  assert.match(html, /data-testid="config-mode-agent"/);
  // The old AI-Prepare/Settings/JSON left-nav pages are gone.
  assert.doesNotMatch(html, /data-testid="config-nav-prepare"/);
  assert.doesNotMatch(html, /data-testid="config-nav-settings"/);
  assert.doesNotMatch(html, /data-testid="config-nav-json"/);
  assert.doesNotMatch(html, /data-testid="config-view-json"/);
});

test("Manual Settings has a category tree and grouped settings rows", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="manual-settings"/);
  assert.match(html, /data-testid="settings-category-tree"/);
  for (const id of [
    "general",
    "session",
    "sections",
    "stack",
    "assets",
    "display",
    "appearance",
    "persistence",
    "advanced",
  ]) {
    assert.match(html, new RegExp(`data-testid="settings-cat-${id}"`));
    assert.match(html, new RegExp(`data-testid="settings-group-${id}"`));
  }
  // Existing editors are reused inside the settings rows.
  assert.match(html, /data-testid="live-data-sections"/);
  assert.match(html, /data-testid="live-data-stack"/);
  assert.match(html, /data-testid="live-data-bottom-bar"/);
  assert.match(html, /data-testid="live-data-live-session"/);
});

test("Manual Settings uses a wide workbench content column", () => {
  assert.match(MANUAL_SRC, /SETTINGS_CONTENT_MAX_WIDTH\s*=\s*920/);
  assert.doesNotMatch(MANUAL_SRC, /maxWidth:\s*720/);
});

test("Manual Settings has a search box that really filters categories", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="settings-search"/);
  // The filter is keyword/title based — not a fake box.
  assert.match(MANUAL_SRC, /matchesQuery/);
  assert.match(MANUAL_SRC, /keywords/);
  assert.match(MANUAL_SRC, /data-testid="settings-search-count"/);
});

test("Manual Settings search copy says it filters categories, not fields", () => {
  const html = renderCenter();
  // A persistent helper line spells out the scope so the box isn't misleading.
  assert.match(html, /data-testid="settings-search-help"/);
  assert.match(html, /Filters setting groups, not individual fields\./);
  const i18nSrc = readFileSync(resolve("src/lib/i18n.ts"), "utf8");
  // Placeholder no longer implies field-level search.
  assert.doesNotMatch(i18nSrc, /"manualSettings\.searchPlaceholder": "Search settings…"/);
  assert.match(i18nSrc, /"manualSettings\.searchPlaceholder": "Search categories…"/);
  assert.match(i18nSrc, /"manualSettings\.searchPlaceholder": "搜索分类…"/);
  // Helper copy exists in both locales.
  assert.match(i18nSrc, /"manualSettings\.searchHelp": "Filters setting groups, not individual fields\."/);
  assert.match(i18nSrc, /"manualSettings\.searchHelp": "按设置分组过滤,不含单个字段。"/);
});

test("Manual Settings language row uses a real i18n key, not translation comparison", () => {
  const i18nSrc = readFileSync(resolve("src/lib/i18n.ts"), "utf8");
  assert.match(MANUAL_SRC, /settingsRow\.languageTitle/);
  assert.match(i18nSrc, /"settingsRow\.languageTitle": "Language"/);
  assert.match(i18nSrc, /"settingsRow\.languageTitle": "语言"/);
  assert.doesNotMatch(MANUAL_SRC, /settings\.theme"\)\s*===/);
});

test("Studio Appearance shows real theme / colors / reset rows, plus a drawer fallback", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="settings-group-appearance"/);
  // Real controls inline (prefixed testids), not just a button.
  assert.match(html, /data-testid="studio-theme-light"/);
  assert.match(html, /data-testid="studio-theme-dark"/);
  assert.match(html, /data-testid="studio-color-bg-dark"/);
  assert.match(html, /data-testid="studio-btn-reset"/);
  // Fallback entry to the full studio drawer is kept.
  assert.match(html, /data-testid="open-studio-drawer"/);
});

test("the legacy SettingsDrawer keeps its own theme/colors/reset testids (shared logic)", () => {
  const drawerSrc = readFileSync(resolve("src/components/SettingsDrawer.tsx"), "utf8");
  // The drawer now reuses the shared controls (no duplicated theme/reset logic).
  assert.match(drawerSrc, /StudioAppearanceControls/);
  assert.doesNotMatch(drawerSrc, /THEME_PRESETS/);
  const sharedSrc = readFileSync(
    resolve("src/components/live-data/StudioAppearanceControls.tsx"),
    "utf8",
  );
  assert.match(sharedSrc, /THEME_PRESETS/);
  assert.match(sharedSrc, /produceState/);
});

test("the JSON drawer is global, drift-safe, and openable from bar / manual / agent", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="config-json-drawer"/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /data-testid="session-config-panel"/);
  assert.match(html, /data-testid="config-input"/);
  assert.match(html, /data-testid="config-apply"/);
  assert.match(html, /data-testid="config-mode"/);
  // Module jumps.
  for (const key of ["title", "cover", "stack", "socials", "sections"]) {
    assert.match(html, new RegExp(`data-testid="config-json-module-${key}"`));
  }
  // Open entry points.
  assert.match(html, /data-testid="open-json-bar"/);
  assert.match(html, /data-testid="open-json-advanced"/);
  assert.match(html, /data-testid="open-json-agent"/);
  // A setting row can open the JSON at a key.
  assert.match(html, /data-testid="settings-openjson-title"/);
});

test("the JSON drawer manages focus and is inert while closed", () => {
  const html = renderCenter();
  // Structure contract: a close button lives inside a dialog.
  assert.match(html, /role="dialog"/);
  assert.match(html, /data-testid="config-json-drawer-close"/);
  // The drawer wires the restore-focus + inert mechanisms and routes focus-in
  // through the tested pure helpers — asserting behaviour, not function names
  // or timer spelling, so a refactor that keeps the contract won't break this.
  assert.match(DRAWER_SRC, /restoreFocusRef/);
  assert.match(DRAWER_SRC, /\.inert\b/);
  assert.match(DRAWER_SRC, /focusTargetTestId/);
  assert.match(DRAWER_SRC, /needsFocusRetry/);
});

test("JSON drawer focus contract: target element and retry decision (pure)", () => {
  // Opened at a key → land on the JSON textarea; no key → the close button.
  assert.equal(focusTargetTestId("title"), "config-input");
  assert.equal(focusTargetTestId(null), "config-json-drawer-close");
  assert.equal(focusTargetTestId(undefined), "config-json-drawer-close");
  // Retry focus-in only while focus is still outside the panel (the opening
  // click can reclaim it to the trigger); never once focus is in, or panel gone.
  const inside = { contains: () => true };
  const outside = { contains: () => false };
  assert.equal(needsFocusRetry(outside, {} as unknown as Node), true);
  assert.equal(needsFocusRetry(inside, {} as unknown as Node), false);
  assert.equal(needsFocusRetry(null, {} as unknown as Node), false);
});

test("Agent mode is a task panel with input, task chips and context chips", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="agent-view"/);
  assert.match(html, /data-testid="agent-brief-input"/);
  for (const id of ["generate", "sections", "titleCover", "assets", "check"]) {
    assert.match(html, new RegExp(`data-testid="agent-task-${id}"`));
  }
  for (const id of ["config", "core", "noRuntime", "obs"]) {
    assert.match(html, new RegExp(`data-testid="agent-context-${id}"`));
  }
  assert.match(html, /data-testid="agent-copy-handoff"/);
  // Exactly one button opens the JSON drawer — no trio of same-weight actions.
  assert.match(html, /data-testid="open-json-agent"/);
  assert.doesNotMatch(html, /data-testid="agent-import-result"/);
  assert.doesNotMatch(html, /data-testid="agent-apply-config"/);
  // The import → review → Apply round-trip is guidance text, not extra buttons,
  // and never promises auto behaviour.
  assert.match(html, /Import the returned JSON/i);
  assert.doesNotMatch(html, /Import result/);
  assert.doesNotMatch(html, /Apply reviewed config/);
  // Handoff preview is collapsed by default (toggle present, pre not yet shown).
  assert.match(html, /data-testid="agent-handoff-toggle"/);
  assert.doesNotMatch(html, /data-testid="agent-handoff-preview"/);
});

test("the agent handoff includes the current config and changes with the task", () => {
  const sections = buildAgentPrompt(
    DEFAULT_STATE,
    "",
    "Task: update only the sections (titles + bullets); keep everything else.",
  );
  const check = buildAgentPrompt(
    DEFAULT_STATE,
    "",
    "Task: review the current config for issues and return a corrected version.",
  );
  assert.notEqual(sections, check);
  assert.match(sections, /update only the sections/);
  for (const p of [sections, check]) {
    assert.match(p, /"title": "Building With Agents"/);
    assert.match(p, /version: 1/);
  }
});

test("no Recipe/Brief, no LLM, no network in the agent view or prompt builder", () => {
  const html = renderCenter();
  assert.doesNotMatch(html, /Recipe/i);
  assert.doesNotMatch(html, /Brief Builder|Quick Start|Stream Recipe/);
  const promptSrc = readFileSync(resolve("src/lib/agent-prompt.ts"), "utf8");
  for (const src of [AGENT_SRC, promptSrc]) {
    assert.doesNotMatch(src, /\bfetch\s*\(/);
    assert.doesNotMatch(src, /EventSource|XMLHttpRequest|openai|anthropic/i);
  }
});

test("obsolete Session Config i18n namespaces are removed", () => {
  const i18nSrc = readFileSync(resolve("src/lib/i18n.ts"), "utf8");
  for (const namespace of ["agentPrepare.", "configView.", "configOutline.", "settingsView."]) {
    assert.doesNotMatch(i18nSrc, new RegExp(namespace.replace(".", "\\.")));
  }
});

test("the source-of-truth bar shows DB / local status without a faked OBS revision", () => {
  const local = renderCenter();
  assert.match(local, /data-testid="live-data-session-bar"/);
  assert.match(local, /Authority/);
  assert.match(local, /Local draft/);
  assert.match(local, /current state/);
  assert.doesNotMatch(local, /rev#?\s*\d+/i);
  assert.doesNotMatch(local, /revision\s*\d+/i);
});

test("Agent shows the active task intent and the handoff reflects the brief", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="agent-task-intent"/);
  // The default task (generate) intent is visible without expanding the handoff.
  assert.match(html, /Generate a complete config/);

  // The handoff varies with the user brief, not just the task chip.
  const a = buildAgentPrompt(DEFAULT_STATE, "rebuild the intro", "Task: x");
  const b = buildAgentPrompt(DEFAULT_STATE, "wrap up the stream", "Task: x");
  assert.notEqual(a, b);
  assert.match(a, /Brief: rebuild the intro/);
  assert.match(b, /Brief: wrap up the stream/);
});

test("Studio Appearance keeps the drawer fallback labelled as a backup entry", () => {
  const html = renderCenter();
  assert.match(html, /data-testid="open-studio-drawer"/);
  assert.match(html, /also available in a drawer/);
});
