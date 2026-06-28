import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_STATE_BY_LOCALE } from "../types";
import {
  STUDIO_PROFILE_STORAGE_KEY,
  applyStudioProfileToState,
  clearStudioProfile,
  loadStudioProfile,
  profileFromState,
  saveStudioProfile,
} from "./studio-profile";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const DEMO_DEFAULT = DEFAULT_STATE_BY_LOCALE.en;

test("studio profile load falls back to null for missing, invalid, or malformed data", () => {
  const storage = new MemoryStorage();
  assert.equal(loadStudioProfile(storage), null);

  storage.setItem(STUDIO_PROFILE_STORAGE_KEY, "{bad json");
  assert.equal(loadStudioProfile(storage), null);

  storage.setItem(STUDIO_PROFILE_STORAGE_KEY, JSON.stringify({ version: 2, socials: "nope" }));
  assert.equal(loadStudioProfile(storage), null);
});

test("studio profile persists a normalized host profile separate from overlay state", () => {
  const storage = new MemoryStorage();
  const profile = {
    version: 1 as const,
    author: "Private Host",
    avatarUrl: "/private-avatar.png",
    avatarVisible: true,
    socialVisible: true,
    socials: [
      { visible: true, iconKey: "github" as const, iconMode: "mono" as const, label: "GitHub", value: "private-handle", customColor: "" },
    ],
  };

  saveStudioProfile(profile, storage);
  const raw = storage.getItem(STUDIO_PROFILE_STORAGE_KEY);
  assert.ok(raw);
  assert.doesNotMatch(raw, /sidebar|bottomBar|sectionsDone|liveSession/);

  const loaded = loadStudioProfile(storage);
  assert.deepEqual(loaded, profile);

  clearStudioProfile(storage);
  assert.equal(loadStudioProfile(storage), null);
});

test("studio profile applies over demo defaults without changing stream content", () => {
  const profiled = applyStudioProfileToState(DEMO_DEFAULT, {
    version: 1,
    author: "Private Host",
    avatarUrl: "/private-avatar.png",
    avatarVisible: true,
    socialVisible: true,
    socials: [
      { visible: true, iconKey: "website", iconMode: "mono", label: "Website", value: "private.example", customColor: "" },
    ],
  });

  assert.equal(profiled.cover.hookText, "with Private Host");
  assert.equal(profiled.cover.avatarUrl, "/private-avatar.png");
  assert.equal(profiled.cover.avatarVisible, true);
  assert.equal(profiled.wallpaper.avatarVisible, true);
  assert.deepEqual(profiled.cover.socials.map((s) => s.value), ["private.example"]);
  assert.equal(profiled.cover.title, DEMO_DEFAULT.cover.title);
  assert.deepEqual(profiled.sidebar.sections, DEMO_DEFAULT.sidebar.sections);
});

test("profileFromState extracts only reusable studio profile fields", () => {
  const state = applyStudioProfileToState(DEMO_DEFAULT, {
    version: 1,
    author: "Private Host",
    avatarUrl: "/private-avatar.png",
    avatarVisible: false,
    socialVisible: false,
    socials: [
      { visible: true, iconKey: "github", iconMode: "mono", label: "GitHub", value: "private-handle", customColor: "" },
    ],
  });

  const profile = profileFromState({
    ...state,
    cover: { ...state.cover, title: "Stream-specific title" },
  });

  assert.deepEqual(profile, {
    version: 1,
    author: "Private Host",
    avatarUrl: "/private-avatar.png",
    avatarVisible: false,
    socialVisible: false,
    socials: [
      { visible: true, iconKey: "github", iconMode: "mono", label: "GitHub", value: "private-handle", customColor: "" },
    ],
  });
});
