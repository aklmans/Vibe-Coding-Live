import type { OverlayState } from "../types";
import type { TranslationKey } from "./i18n";

/** The artifact the current workbench tab exports (Session Config mirrors overlay). */
export type PrimaryExportKind = "overlay" | "cover" | "poster" | "wallpaper";

/** The four primary export handlers the current-tab action routes to. */
export interface PrimaryExportHandlers {
  onExportOverlay: () => void;
  onExportCover: () => void;
  onExportPoster: () => void;
  onExportWallpaper: () => void;
}

/**
 * Single source of truth for "which artifact does the current tab export?".
 * The TopBar primary button, the ⌘E shortcut, and the command palette all route
 * through this so the mapping — including the rule that Session Config ("live")
 * mirrors the overlay, matching the dimmed workbench behind its dialog — lives in
 * exactly one place.
 */
export function currentExportKind(
  activeTab: OverlayState["activeTab"],
): PrimaryExportKind {
  switch (activeTab) {
    case "cover":
      return "cover";
    case "poster":
      return "poster";
    case "wallpaper":
      return "wallpaper";
    case "overlay":
    case "live":
      return "overlay";
  }
}

/** The handler that exports the current tab's artifact. */
export function exportForTab(
  activeTab: OverlayState["activeTab"],
  handlers: PrimaryExportHandlers,
): () => void {
  switch (currentExportKind(activeTab)) {
    case "cover":
      return handlers.onExportCover;
    case "poster":
      return handlers.onExportPoster;
    case "wallpaper":
      return handlers.onExportWallpaper;
    case "overlay":
      return handlers.onExportOverlay;
  }
}

/** The i18n label key for the current tab's primary export (export.overlay / .cover / …). */
export function currentExportLabelKey(
  activeTab: OverlayState["activeTab"],
): TranslationKey {
  return `export.${currentExportKind(activeTab)}` as TranslationKey;
}
