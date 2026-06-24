import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_STATE_BY_LOCALE } from "../types";
import {
  applyLiveBriefDraftToOverlayState,
  formatLiveBriefDraftJson,
  generateLiveBriefDraft,
} from "./session-brief";

test("generateLiveBriefDraft turns a freeform brief into a structured stream draft", () => {
  const draft = generateLiveBriefDraft(
    "标题：AI Agent 重构直播。目标：把 Recipe 改成 Brief Builder。任务：理解问题、生成草稿、应用到直播。工具栈：Codex、Cursor、Next.js、OBS。",
    "zh",
  );

  assert.equal(draft.title, "AI Agent 重构直播");
  assert.equal(draft.topic, "把 Recipe 改成 Brief Builder");
  assert.deepEqual(draft.sections.map((section) => section.title), [
    "今日目标",
    "当前问题",
    "输出记录",
  ]);
  assert.deepEqual(draft.sections[0]?.bullets, [
    "理解问题",
    "生成草稿",
    "应用到直播",
  ]);
  assert.deepEqual(draft.stackItems, ["Codex", "Cursor", "Next.js", "OBS"]);
  assert.deepEqual(draft.badgeKeys, ["codex", "cursor"]);
});

test("applyLiveBriefDraftToOverlayState updates live surfaces without touching socials", () => {
  const base = DEFAULT_STATE_BY_LOCALE.zh;
  const draft = generateLiveBriefDraft(
    "标题：AI Agent 重构直播。目标：把 Recipe 改成 Brief Builder。任务：理解问题、生成草稿、应用到直播。工具栈：Codex、Cursor、Next.js、OBS。",
    "zh",
  );
  const next = applyLiveBriefDraftToOverlayState(base, draft);

  assert.equal(next.cover.title, "AI Agent 重构直播");
  assert.equal(next.cover.todayTopic, "把 Recipe 改成 Brief Builder");
  assert.equal(next.sidebar.activeSection, 0);
  assert.deepEqual(next.sidebar.sections.map((section) => section.title), [
    "今日目标",
    "当前问题",
    "输出记录",
  ]);
  assert.deepEqual(next.sidebar.sections[0]?.bullets, [
    "理解问题",
    "生成草稿",
    "应用到直播",
  ]);
  assert.deepEqual(next.sidebar.sectionsDone, [
    [false, false, false],
    [false, false, false],
    [false, false, false],
  ]);
  assert.deepEqual(next.stack.items.map((item) => item.label), [
    "Codex",
    "Cursor",
    "Next.js",
    "OBS",
  ]);
  assert.deepEqual(next.stack.items.map((item) => item.iconKey), [
    undefined,
    "cursor",
    "nextdotjs",
    "obs",
  ]);
  assert.deepEqual(
    next.cover.badges.filter((badge) => badge.visible).map((badge) => badge.iconKey),
    ["codex", "cursor"],
  );
  assert.deepEqual(next.cover.socials, base.cover.socials);
});

test("formatLiveBriefDraftJson exports a stable editable JSON draft", () => {
  const draft = generateLiveBriefDraft(
    "Title: AI Agent Refactor. Goal: Replace Recipe with Brief Builder. Tasks: define flow, generate draft, apply stream data. Stack: Codex, Cursor, Next.js, OBS.",
    "en",
  );
  const parsed = JSON.parse(formatLiveBriefDraftJson(draft));

  assert.equal(parsed.title, "AI Agent Refactor");
  assert.equal(parsed.topic, "Replace Recipe with Brief Builder");
  assert.equal(parsed.sections.length, 3);
  assert.deepEqual(parsed.stackItems, ["Codex", "Cursor", "Next.js", "OBS"]);
});
