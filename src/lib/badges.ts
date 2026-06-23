// Badge identity model. Runtime badges are registry-backed by `iconKey` and
// rendered as inline SVGs, so exported canvases do not depend on remote icon
// URLs. The old `kind` field is accepted only in stateStorage migration.

export type LegacyBadgeKind =
  | "claude"
  | "codex"
  | "gemini"
  | "grok"
  | "custom";

export type BadgeIconKey =
  | "claude"
  | "claude-code"
  | "anthropic"
  | "codex"
  | "openai"
  | "gemini"
  | "gemini-cli"
  | "cursor"
  | "github-copilot"
  | "copilot"
  | "deepseek"
  | "grok"
  | "qwen"
  | "doubao"
  | "cline"
  | "kimi"
  | "moonshot"
  | "z-ai"
  | "junie"
  | "minimax"
  | "opencode"
  | "antigravity"
  | "chatgpt"
  | "custom";

export type BadgeIconMode = "mono" | "brand";
export type BadgeIconCategory = "recommended" | "model" | "coding" | "provider";

export interface BadgeIconMeta {
  iconKey: Exclude<BadgeIconKey, "custom">;
  label: string;
  aliases: string[];
  category: BadgeIconCategory;
  recommended?: boolean;
}

export const BADGE_ICON_REGISTRY: Record<
  Exclude<BadgeIconKey, "custom">,
  BadgeIconMeta
> = {
  claude: {
    iconKey: "claude",
    label: "Claude",
    aliases: ["anthropic", "opus", "sonnet", "haiku"],
    category: "recommended",
    recommended: true,
  },
  "claude-code": {
    iconKey: "claude-code",
    label: "Claude Code",
    aliases: ["claude cli", "anthropic code"],
    category: "coding",
    recommended: true,
  },
  anthropic: {
    iconKey: "anthropic",
    label: "Anthropic",
    aliases: ["claude company"],
    category: "provider",
  },
  codex: {
    iconKey: "codex",
    label: "Codex",
    aliases: ["openai codex", "code agent"],
    category: "recommended",
    recommended: true,
  },
  openai: {
    iconKey: "openai",
    label: "OpenAI",
    aliases: ["gpt", "chatgpt"],
    category: "provider",
  },
  gemini: {
    iconKey: "gemini",
    label: "Gemini",
    aliases: ["google"],
    category: "model",
  },
  "gemini-cli": {
    iconKey: "gemini-cli",
    label: "Gemini CLI",
    aliases: ["google cli", "gemini code"],
    category: "coding",
  },
  cursor: {
    iconKey: "cursor",
    label: "Cursor",
    aliases: ["editor"],
    category: "coding",
  },
  "github-copilot": {
    iconKey: "github-copilot",
    label: "GitHub Copilot",
    aliases: ["copilot", "github"],
    category: "coding",
  },
  copilot: {
    iconKey: "copilot",
    label: "Copilot",
    aliases: ["microsoft"],
    category: "coding",
  },
  deepseek: {
    iconKey: "deepseek",
    label: "DeepSeek",
    aliases: ["deep seek"],
    category: "model",
  },
  grok: {
    iconKey: "grok",
    label: "Grok",
    aliases: ["xai", "x ai"],
    category: "model",
  },
  qwen: {
    iconKey: "qwen",
    label: "Qwen",
    aliases: ["通义", "alibaba"],
    category: "model",
  },
  doubao: {
    iconKey: "doubao",
    label: "Doubao",
    aliases: ["豆包", "bytedance"],
    category: "model",
  },
  cline: {
    iconKey: "cline",
    label: "Cline",
    aliases: ["vscode agent"],
    category: "coding",
  },
  kimi: {
    iconKey: "kimi",
    label: "Kimi",
    aliases: ["moonshot kimi", "月之暗面"],
    category: "model",
    recommended: true,
  },
  moonshot: {
    iconKey: "moonshot",
    label: "Moonshot",
    aliases: ["moonshot ai", "kimi provider", "月之暗面"],
    category: "provider",
  },
  "z-ai": {
    iconKey: "z-ai",
    label: "Z.ai",
    aliases: ["zai", "z ai", "glm", "chatglm", "智谱"],
    category: "model",
  },
  junie: {
    iconKey: "junie",
    label: "Junie",
    aliases: ["jetbrains", "coding agent"],
    category: "coding",
  },
  minimax: {
    iconKey: "minimax",
    label: "MiniMax",
    aliases: ["minimx", "mini max", "海螺"],
    category: "model",
  },
  opencode: {
    iconKey: "opencode",
    label: "OpenCode",
    aliases: ["open code", "code agent", "terminal agent"],
    category: "coding",
  },
  antigravity: {
    iconKey: "antigravity",
    label: "Antigravity",
    aliases: ["google antigravity", "google agent"],
    category: "coding",
  },
  chatgpt: {
    iconKey: "chatgpt",
    label: "ChatGPT",
    aliases: ["openai chatgpt", "gpt", "gpt-5"],
    category: "model",
    recommended: true,
  },
};

export const BADGE_ICON_OPTIONS = Object.values(BADGE_ICON_REGISTRY);

export const LEGACY_BADGE_KIND_TO_ICON_KEY: Record<LegacyBadgeKind, BadgeIconKey> = {
  claude: "claude",
  codex: "codex",
  gemini: "gemini",
  grok: "grok",
  custom: "custom",
};

export interface BadgeConfig {
  visible: boolean;
  iconKey: BadgeIconKey;
  iconMode: BadgeIconMode;
  label: string;
  /** Legacy/custom compatibility only. Registry-backed badges do not read it. */
  customIconUrl: string;
}

export function isBadgeIconKey(value: unknown): value is BadgeIconKey {
  return (
    value === "custom" ||
    (typeof value === "string" && value in BADGE_ICON_REGISTRY)
  );
}

export function isLegacyBadgeKind(value: unknown): value is LegacyBadgeKind {
  return (
    value === "claude" ||
    value === "codex" ||
    value === "gemini" ||
    value === "grok" ||
    value === "custom"
  );
}

export function isBadgeIconMode(value: unknown): value is BadgeIconMode {
  return value === "mono" || value === "brand";
}

export function badgeLabelForIconKey(iconKey: BadgeIconKey, fallback = "Badge"): string {
  if (iconKey === "custom") return fallback;
  return BADGE_ICON_REGISTRY[iconKey].label;
}

export function searchBadgeIcons(query: string): BadgeIconMeta[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [...BADGE_ICON_OPTIONS].sort((a, b) => {
      if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
  }

  return BADGE_ICON_OPTIONS.filter((meta) => {
    const haystack = [meta.label, meta.iconKey, meta.category, ...meta.aliases]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
