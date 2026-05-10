import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_STATE_BY_LOCALE } from "../types";
import {
  applyLiveDataToOverlayState,
  overlayStateToLiveData,
} from "./live-data";

test("overlayStateToLiveData extracts only stream data from overlay state", () => {
  const base = DEFAULT_STATE_BY_LOCALE.en;
  const state = {
    ...base,
    sidebar: {
      ...base.sidebar,
      activeSection: 1,
      sectionsDone: [
        [true, false, false],
        [false, true, false],
        [false, false, true],
      ],
    },
    liveSession: {
      startedAt: "2026-05-10T16:00:00.000Z",
    },
    cover: {
      ...base.cover,
      title: "Do not persist visual title here",
    },
  };

  const liveData = overlayStateToLiveData(state, {
    id: "session-1",
    dateKey: "2026-05-10",
    locale: "en",
    title: "Live 2026-05-10",
    status: "live",
    startedAt: "2026-05-10T16:00:00.000Z",
    endedAt: null,
    createdAt: "2026-05-10T15:00:00.000Z",
    updatedAt: "2026-05-10T16:01:00.000Z",
  });

  assert.equal(liveData.session.id, "session-1");
  assert.equal(liveData.activeSection, 1);
  assert.equal(liveData.sections[0]?.tasks[0]?.done, true);
  assert.equal(liveData.sections[1]?.tasks[1]?.done, true);
  assert.equal(liveData.sections[2]?.tasks[2]?.done, true);
  assert.deepEqual(liveData.stackItems, base.stack.items);
  assert.deepEqual(liveData.bottomBar.segments, base.bottomBar.segments);
  assert.equal("cover" in liveData, false);
});

test("applyLiveDataToOverlayState updates stream data while preserving visual settings", () => {
  const base = {
    ...DEFAULT_STATE_BY_LOCALE.en,
    activeTab: "live" as const,
    cover: {
      ...DEFAULT_STATE_BY_LOCALE.en.cover,
      title: "Keep this visual title",
    },
  };

  const next = applyLiveDataToOverlayState(base, {
    session: {
      id: "session-2",
      dateKey: "2026-05-11",
      locale: "en",
      title: "Live 2026-05-11",
      status: "ended",
      startedAt: "2026-05-11T16:00:00.000Z",
      endedAt: "2026-05-11T18:00:00.000Z",
      createdAt: "2026-05-11T15:00:00.000Z",
      updatedAt: "2026-05-11T18:00:00.000Z",
    },
    activeSection: 2,
    sections: [
      { title: "Goal", tasks: [{ text: "Ship DB", done: true }] },
      { title: "Problem", tasks: [{ text: "Keep simple", done: false }] },
      { title: "Log", tasks: [{ text: "Verified", done: true }] },
    ],
    bottomBar: {
      visible: false,
      segments: [{ kind: "text", title: "Now", text: "Database-backed" }],
    },
    stackItems: ["Next.js", "Postgres"],
  });

  assert.equal(next.activeTab, "live");
  assert.equal(next.cover.title, "Keep this visual title");
  assert.equal(next.sidebar.activeSection, 2);
  assert.equal(next.sidebar.sections[0]?.title, "Goal");
  assert.deepEqual(next.sidebar.sections[0]?.bullets, ["Ship DB"]);
  assert.deepEqual(next.sidebar.sectionsDone[0], [true]);
  assert.equal(next.bottomBar.visible, false);
  assert.deepEqual(next.bottomBar.segments, [
    { kind: "text", title: "Now", text: "Database-backed" },
  ]);
  assert.deepEqual(next.stack.items, ["Next.js", "Postgres"]);
  assert.equal(next.liveSession.startedAt, "2026-05-11T16:00:00.000Z");
});
