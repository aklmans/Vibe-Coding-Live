// Focus contract for the global JSON drawer, kept as small pure helpers so the
// behaviour can be unit-tested without a browser and without pinning tests to
// the component's internal function names or timer spelling.

/** The element a freshly opened drawer moves focus to (in-dialog, never the trigger). */
export const DRAWER_CLOSE_TESTID = "config-json-drawer-close";
export const DRAWER_INPUT_TESTID = "config-input";

/**
 * Where focus should land when the drawer opens:
 * - opened at a specific key → the JSON textarea, so the user lands on what they
 *   clicked (the caller then selects/scrolls to that key);
 * - opened with no key → the close button, a safe focus target inside the dialog.
 */
export function focusTargetTestId(focusKey: string | null | undefined): string {
  return focusKey ? DRAWER_INPUT_TESTID : DRAWER_CLOSE_TESTID;
}

/**
 * Whether focus-in should be retried. The click that opens the drawer can
 * reclaim focus to its own trigger after the first attempt, stranding focus
 * behind the scrim — so if focus isn't inside the panel yet, try again.
 */
export function needsFocusRetry(
  panel: { contains(node: Node | null): boolean } | null,
  active: Node | null,
): boolean {
  return panel != null && !panel.contains(active);
}
