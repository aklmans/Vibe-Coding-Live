import type { Locale } from "./i18n";
import type { OverlayState } from "../types";

export async function publishLiveState(
  state: OverlayState,
  locale: Locale,
  signal?: AbortSignal,
): Promise<void> {
  await fetch("/api/live-state", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ locale, state }),
    signal,
  });
}
