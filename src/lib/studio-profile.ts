import type { OverlayState } from "../types";
import type { SocialConfig } from "./socials";

export const STUDIO_PROFILE_STORAGE_KEY = "vibe-studio-profile";

export interface StudioProfile {
  version: 1;
  author: string;
  avatarUrl: string;
  avatarVisible: boolean;
  socialVisible: boolean;
  socials: SocialConfig[];
}

type ProfileStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function storageOrWindow(storage?: ProfileStorage): ProfileStorage | null {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function cloneSocial(social: SocialConfig): SocialConfig {
  return {
    visible: Boolean(social.visible),
    iconKey: social.iconKey,
    iconMode: social.iconMode === "brand" ? "brand" : "mono",
    label: typeof social.label === "string" ? social.label : "",
    value: typeof social.value === "string" ? social.value : "",
    customColor: typeof social.customColor === "string" ? social.customColor : "",
  };
}

function isSocialConfig(value: unknown): value is SocialConfig {
  if (!value || typeof value !== "object") return false;
  const social = value as Partial<SocialConfig>;
  return (
    typeof social.visible === "boolean" &&
    (social.iconKey === undefined || typeof social.iconKey === "string") &&
    (social.iconMode === "mono" || social.iconMode === "brand") &&
    typeof social.label === "string" &&
    typeof social.value === "string" &&
    typeof social.customColor === "string"
  );
}

function normalizeProfile(value: unknown): StudioProfile | null {
  if (!value || typeof value !== "object") return null;
  const profile = value as Partial<StudioProfile>;
  if (profile.version !== 1) return null;
  if (typeof profile.author !== "string") return null;
  if (typeof profile.avatarUrl !== "string") return null;
  if (typeof profile.avatarVisible !== "boolean") return null;
  if (typeof profile.socialVisible !== "boolean") return null;
  if (!Array.isArray(profile.socials) || !profile.socials.every(isSocialConfig)) return null;
  return {
    version: 1,
    author: profile.author,
    avatarUrl: profile.avatarUrl,
    avatarVisible: profile.avatarVisible,
    socialVisible: profile.socialVisible,
    socials: profile.socials.map(cloneSocial),
  };
}

export function loadStudioProfile(storage?: ProfileStorage): StudioProfile | null {
  const target = storageOrWindow(storage);
  if (!target) return null;
  try {
    const raw = target.getItem(STUDIO_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return normalizeProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveStudioProfile(profile: StudioProfile, storage?: ProfileStorage): void {
  const target = storageOrWindow(storage);
  if (!target) return;
  const normalized = normalizeProfile(profile);
  if (!normalized) return;
  target.setItem(STUDIO_PROFILE_STORAGE_KEY, JSON.stringify(normalized));
}

export function clearStudioProfile(storage?: ProfileStorage): void {
  storageOrWindow(storage)?.removeItem(STUDIO_PROFILE_STORAGE_KEY);
}

function authorFromHookText(hookText: string): string {
  return hookText.replace(/^with\s+/i, "").trim();
}

function hookTextFromAuthor(author: string): string {
  const trimmed = author.trim();
  return trimmed ? `with ${trimmed}` : "";
}

export function profileFromState(state: OverlayState): StudioProfile {
  return {
    version: 1,
    author: authorFromHookText(state.cover.hookText),
    avatarUrl: state.cover.avatarUrl,
    avatarVisible: state.cover.avatarVisible,
    socialVisible: state.cover.socialVisible,
    socials: state.cover.socials.map(cloneSocial),
  };
}

export function applyStudioProfileToState(
  state: OverlayState,
  profile: StudioProfile | null,
): OverlayState {
  if (!profile) return state;
  const normalized = normalizeProfile(profile);
  if (!normalized) return state;
  return {
    ...state,
    cover: {
      ...state.cover,
      avatarUrl: normalized.avatarUrl,
      avatarVisible: normalized.avatarVisible,
      hookText: hookTextFromAuthor(normalized.author),
      socialVisible: normalized.socialVisible,
      socials: normalized.socials.map(cloneSocial),
    },
    wallpaper: {
      ...state.wallpaper,
      avatarVisible: normalized.avatarVisible,
      socialVisible: normalized.socialVisible,
    },
  };
}
