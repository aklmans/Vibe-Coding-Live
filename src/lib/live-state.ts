import { DEFAULT_STATE_BY_LOCALE, type OverlayState } from "../types";
import { normalizeOverlayState } from "../stateStorage";
import type { Locale } from "./i18n";

export interface LiveStateSnapshot {
  locale: Locale;
  state: OverlayState;
  revision: number;
  updatedAt: string;
}

export type LiveStateListener = (snapshot: LiveStateSnapshot) => void;

interface LiveStateStore {
  get: () => LiveStateSnapshot;
  set: (payload: unknown) => LiveStateSnapshot;
  subscribe: (listener: LiveStateListener) => () => void;
}

interface LiveStateGlobal {
  __vibeOverlayLiveStateStore?: LiveStateStore;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function localeOrDefault(value: unknown, fallback: Locale): Locale {
  return value === "zh" || value === "en" ? value : fallback;
}

export function normalizeLiveStatePayload(
  payload: unknown,
  fallback?: LiveStateSnapshot,
): LiveStateSnapshot {
  const source = record(payload);
  const fallbackLocale = fallback?.locale ?? "zh";
  const locale = localeOrDefault(source?.locale, fallbackLocale);
  const rawState = source && "state" in source ? source.state : payload;

  return {
    locale,
    state: normalizeOverlayState(rawState, DEFAULT_STATE_BY_LOCALE[locale]),
    revision: fallback?.revision ?? 0,
    updatedAt: fallback?.updatedAt ?? "",
  };
}

export function createLiveStateStore(initialPayload?: unknown): LiveStateStore {
  let revision = 0;
  let snapshot: LiveStateSnapshot = {
    ...normalizeLiveStatePayload(
      initialPayload ?? {
        locale: "zh",
        state: DEFAULT_STATE_BY_LOCALE.zh,
      },
    ),
    revision,
    updatedAt: new Date(0).toISOString(),
  };
  const listeners = new Set<LiveStateListener>();

  return {
    get() {
      return snapshot;
    },
    set(payload: unknown) {
      revision += 1;
      snapshot = {
        ...normalizeLiveStatePayload(payload, snapshot),
        revision,
        updatedAt: new Date().toISOString(),
      };
      listeners.forEach((listener) => listener(snapshot));
      return snapshot;
    },
    subscribe(listener: LiveStateListener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const liveStateGlobal = globalThis as typeof globalThis & LiveStateGlobal;

export const liveStateStore =
  liveStateGlobal.__vibeOverlayLiveStateStore ??
  (liveStateGlobal.__vibeOverlayLiveStateStore = createLiveStateStore());

export function getLiveStateSnapshot(): LiveStateSnapshot {
  return liveStateStore.get();
}

export function setLiveStateSnapshot(payload: unknown): LiveStateSnapshot {
  return liveStateStore.set(payload);
}

export function subscribeLiveState(
  listener: LiveStateListener,
): () => void {
  return liveStateStore.subscribe(listener);
}
