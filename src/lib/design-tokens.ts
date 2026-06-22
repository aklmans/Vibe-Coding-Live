// Warm editorial app-shell tokens.
//
// Single source of truth for the builder shell — top bar, inspector, settings
// drawer, command palette, form controls, and menus. Phase 1 of the
// `editorial-live` redesign moves these surfaces from a cool blue-purple neon
// look toward a warm, quiet editorial workbench (see DESIGN_LANGUAGE.md §4).
//
// Tokens are grouped by role. The final "canvas / broadcast" group intentionally
// keeps its pre-redesign values: the overlay/wallpaper canvases, OBS camera
// frame, and LIVE badge still consume these, and Phase 1 must not change
// exported assets or OBS output. Canvas visuals are a later phase.
//
// Naming note: a few legacy keys (`panelSurface`, `focus`, `cyan`/`purple`/
// `teal`/`warm`, `brandBlue`/`uploadBlue`) are still referenced across the shell.
// They are kept as aliases and remapped to warm values so every consumer warms
// up consistently without a wide rename.

export const UI_COLORS = {
  // ── Shell surfaces (warm black) ───────────────────────────────────────────
  shellBg: "#1a1a1a", // app background
  appSurface: "#20201e", // elevated surface: top bar, inspector, drawer, palette
  controlSurface: "#24231f", // inputs, buttons, menus
  hoverSurface: "#2c2a24", // subtle hover / active-segment fill
  inputInset: "#151412", // inset rows inside editors
  previewBadgeSurface: "#24231f", // small metadata chips
  dangerSurface: "#251513", // danger background wash

  // ── Lines (warm hairlines) ────────────────────────────────────────────────
  border: "#3a3832", // hairline borders + dividers
  rule: "#4a463d", // slightly stronger rule / hover border
  // Legacy aliases — widely used as 1px borders/dividers and the occasional
  // subtle fill (toggle tracks, active segments). All resolve to the warm
  // hairline so structure stays consistent across the shell.
  panelSurface: "#3a3832",
  controlBorder: "#3a3832",
  controlBorderHover: "#4a463d",
  subtleBorderHover: "#4a463d",
  resetBorder: "#3a3832",

  // ── Text ──────────────────────────────────────────────────────────────────
  text: "#fafafa",
  textSoft: "#c8c5be", // labels
  textMuted: "#8f8c85", // secondary text + hints
  textSubtle: "#6b6862", // faint metadata

  // ── Accent (warm orange — a mark, never a large fill) ──────────────────────
  accent: "#e8835b", // rings, underlines, marks, toggles
  accentText: "#ef9a73", // accent used as small label/kbd text on dark
  focus: "#e8835b", // legacy alias: focus rings, toggle-on, section marks

  // ── Semantic ──────────────────────────────────────────────────────────────
  danger: "#e07070",
  success: "#5ab88a",

  // ── Legacy multi-accent keys, desaturated to warm editorial tones ──────────
  // Still consumed by inspector section markers and the live-data panels.
  cyan: "#86a39b", // muted sage
  purple: "#b59a86", // warm taupe
  teal: "#7fa89a", // muted teal
  warm: "#e0a766", // warm amber
  brandBlue: "#ef9a73", // brand mark removed; kept as a warm accent text
  uploadBlue: "#e8835b", // upload affordance accent

  // ── Canvas / broadcast (UNCHANGED — Phase 1 keeps exports + OBS stable) ─────
  appBackground: "#070A12", // overlay main-screen placeholder + wallpaper bg
  live: "#E62117",
  white: "#fff",
  cameraShell: "#050710",
  cameraStage: "#07090F",
  macRed: "#FF5F57",
  macYellow: "#FEBC2E",
  macGreen: "#28C840",
} as const;

export const UI_BORDERS = {
  panel: `1px solid ${UI_COLORS.border}`,
  control: `1px solid ${UI_COLORS.controlBorder}`,
  hair: `1px solid ${UI_COLORS.border}`,
  danger: `1px solid ${UI_COLORS.danger}30`,
} as const;
