// Social link presets shown in Sidebar / Overlay sidebar / Poster footer.
// Each preset hard-codes the visual treatment (background + border + text)
// so styling stays consistent regardless of which canvas renders it.
//
// "kind: 'custom'" lets the user invent their own label and color when none
// of the presets match the platform they want to show.

import type { ColorTokens } from "./theme";

export type SocialKind =
  | "bilibili"
  | "blog"
  | "github"
  | "qq"
  | "x"
  | "youtube"
  | "wechat"
  | "custom";

export interface SocialConfig {
  visible: boolean;
  kind: SocialKind;
  label: string;
  value: string;
  customColor: string;
}

export interface SocialStyle {
  color: string;
  background: string;
  border: string;
}

// Presets that don't depend on user theme tokens (fixed brand colors).
interface BrandPreset {
  label: string;
  style: SocialStyle;
}

const BRAND_PRESETS: Record<
  Exclude<SocialKind, "blog" | "github" | "qq" | "custom">,
  BrandPreset
> = {
  bilibili: {
    label: "B站",
    style: {
      color: "#ffffff",
      background: "#E62117",
      border: "1px solid #E62117",
    },
  },
  x: {
    label: "X",
    style: {
      color: "#ffffff",
      background: "#000000",
      border: "1px solid #1f1f1f",
    },
  },
  youtube: {
    label: "YouTube",
    style: {
      color: "#ffffff",
      background: "#FF0000",
      border: "1px solid #FF0000",
    },
  },
  wechat: {
    label: "微信",
    style: {
      color: "#ffffff",
      background: "#07C160",
      border: "1px solid #07C160",
    },
  },
};

export const SOCIAL_KIND_OPTIONS: { value: SocialKind; label: string }[] = [
  { value: "bilibili", label: "B站" },
  { value: "blog", label: "博客" },
  { value: "github", label: "GitHub" },
  { value: "qq", label: "QQ群" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
  { value: "wechat", label: "微信" },
  { value: "custom", label: "Custom…" },
];

export const SOCIAL_KIND_VALUES: SocialKind[] = SOCIAL_KIND_OPTIONS.map(
  (o) => o.value,
);

// Default label shown when the user picks a kind from the dropdown.
export function defaultSocialLabel(kind: SocialKind): string {
  switch (kind) {
    case "bilibili":
      return "B站";
    case "blog":
      return "博客";
    case "github":
      return "GitHub";
    case "qq":
      return "QQ群";
    case "x":
      return "X";
    case "youtube":
      return "YouTube";
    case "wechat":
      return "微信";
    case "custom":
      return "";
  }
}

/**
 * Resolve the visual style for a social label. Token-bound presets (blog /
 * github / qq) follow the active theme so a Neon -> Editorial swap repaints
 * them automatically; brand presets keep their fixed brand color.
 */
export function socialStyle(
  badge: SocialConfig,
  colors: ColorTokens,
): SocialStyle {
  switch (badge.kind) {
    case "bilibili":
    case "x":
    case "youtube":
    case "wechat":
      return BRAND_PRESETS[badge.kind].style;
    case "blog":
      return {
        color: colors.cyanAccent,
        background: `${colors.cyanAccent}18`,
        border: `1px solid ${colors.cyanAccent}40`,
      };
    case "github":
      return {
        color: colors.mutedText,
        background: `${colors.borderColor}15`,
        border: `1px solid ${colors.borderColor}30`,
      };
    case "qq":
      return {
        color: colors.warmAccent,
        background: `${colors.warmAccent}15`,
        border: `1px solid ${colors.warmAccent}35`,
      };
    case "custom": {
      const c = badge.customColor || colors.borderColor;
      return {
        color: c,
        background: `${c}18`,
        border: `1px solid ${c}40`,
      };
    }
  }
}

export function isSocialKind(value: unknown): value is SocialKind {
  return (
    typeof value === "string" && (SOCIAL_KIND_VALUES as string[]).includes(value)
  );
}
