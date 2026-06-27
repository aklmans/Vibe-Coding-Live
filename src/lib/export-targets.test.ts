import assert from "node:assert/strict";
import test from "node:test";
import {
  currentExportKind,
  currentExportLabelKey,
  exportForTab,
} from "./export-targets";

test("currentExportKind maps each tab to its primary artifact (Session Config mirrors overlay)", () => {
  assert.equal(currentExportKind("overlay"), "overlay");
  assert.equal(currentExportKind("live"), "overlay"); // Session Config mirrors the overlay
  assert.equal(currentExportKind("cover"), "cover");
  assert.equal(currentExportKind("poster"), "poster");
  assert.equal(currentExportKind("wallpaper"), "wallpaper");
});

test("exportForTab routes to the one handler for the current tab, firing no others", () => {
  const calls: string[] = [];
  const handlers = {
    onExportOverlay: () => calls.push("overlay"),
    onExportCover: () => calls.push("cover"),
    onExportPoster: () => calls.push("poster"),
    onExportWallpaper: () => calls.push("wallpaper"),
  };
  exportForTab("live", handlers)();
  exportForTab("cover", handlers)();
  exportForTab("poster", handlers)();
  exportForTab("wallpaper", handlers)();
  exportForTab("overlay", handlers)();
  assert.deepEqual(calls, ["overlay", "cover", "poster", "wallpaper", "overlay"]);
});

test("currentExportLabelKey points at the per-tab export.* i18n key", () => {
  assert.equal(currentExportLabelKey("overlay"), "export.overlay");
  assert.equal(currentExportLabelKey("live"), "export.overlay");
  assert.equal(currentExportLabelKey("cover"), "export.cover");
  assert.equal(currentExportLabelKey("poster"), "export.poster");
  assert.equal(currentExportLabelKey("wallpaper"), "export.wallpaper");
});
