import type { CSSProperties, ComponentType } from "react";
import AnthropicMono from "@lobehub/icons/es/Anthropic/components/Mono";
import AnthropicText from "@lobehub/icons/es/Anthropic/components/Text";
import AntigravityColor from "@lobehub/icons/es/Antigravity/components/Color";
import AntigravityMono from "@lobehub/icons/es/Antigravity/components/Mono";
import AntigravityText from "@lobehub/icons/es/Antigravity/components/Text";
import ClaudeColor from "@lobehub/icons/es/Claude/components/Color";
import ClaudeMono from "@lobehub/icons/es/Claude/components/Mono";
import ClaudeText from "@lobehub/icons/es/Claude/components/Text";
import ClaudeCodeColor from "@lobehub/icons/es/ClaudeCode/components/Color";
import ClaudeCodeMono from "@lobehub/icons/es/ClaudeCode/components/Mono";
import ClaudeCodeText from "@lobehub/icons/es/ClaudeCode/components/Text";
import ClineMono from "@lobehub/icons/es/Cline/components/Mono";
import ClineText from "@lobehub/icons/es/Cline/components/Text";
import KimiColor from "@lobehub/icons/es/Kimi/components/Color";
import KimiMono from "@lobehub/icons/es/Kimi/components/Mono";
import KimiText from "@lobehub/icons/es/Kimi/components/Text";
import CodexColor from "@lobehub/icons/es/Codex/components/Color";
import CodexMono from "@lobehub/icons/es/Codex/components/Mono";
import CodexText from "@lobehub/icons/es/Codex/components/Text";
import CopilotColor from "@lobehub/icons/es/Copilot/components/Color";
import CopilotMono from "@lobehub/icons/es/Copilot/components/Mono";
import CopilotText from "@lobehub/icons/es/Copilot/components/Text";
import CursorMono from "@lobehub/icons/es/Cursor/components/Mono";
import CursorText from "@lobehub/icons/es/Cursor/components/Text";
import DeepSeekColor from "@lobehub/icons/es/DeepSeek/components/Color";
import DeepSeekMono from "@lobehub/icons/es/DeepSeek/components/Mono";
import DeepSeekText from "@lobehub/icons/es/DeepSeek/components/Text";
import DoubaoColor from "@lobehub/icons/es/Doubao/components/Color";
import DoubaoMono from "@lobehub/icons/es/Doubao/components/Mono";
import DoubaoText from "@lobehub/icons/es/Doubao/components/Text";
import GeminiColor from "@lobehub/icons/es/Gemini/components/Color";
import GeminiMono from "@lobehub/icons/es/Gemini/components/Mono";
import GeminiText from "@lobehub/icons/es/Gemini/components/Text";
import GeminiCLIColor from "@lobehub/icons/es/GeminiCLI/components/Color";
import GeminiCLIMono from "@lobehub/icons/es/GeminiCLI/components/Mono";
import GeminiCLIText from "@lobehub/icons/es/GeminiCLI/components/Text";
import GithubCopilotMono from "@lobehub/icons/es/GithubCopilot/components/Mono";
import GithubCopilotText from "@lobehub/icons/es/GithubCopilot/components/Text";
import GrokMono from "@lobehub/icons/es/Grok/components/Mono";
import GrokText from "@lobehub/icons/es/Grok/components/Text";
import MinimaxColor from "@lobehub/icons/es/Minimax/components/Color";
import MinimaxMono from "@lobehub/icons/es/Minimax/components/Mono";
import MinimaxText from "@lobehub/icons/es/Minimax/components/Text";
import MoonshotMono from "@lobehub/icons/es/Moonshot/components/Mono";
import MoonshotText from "@lobehub/icons/es/Moonshot/components/Text";
import OpenAIMono from "@lobehub/icons/es/OpenAI/components/Mono";
import OpenAIText from "@lobehub/icons/es/OpenAI/components/Text";
import OpenCodeMono from "@lobehub/icons/es/OpenCode/components/Mono";
import OpenCodeText from "@lobehub/icons/es/OpenCode/components/Text";
import QwenColor from "@lobehub/icons/es/Qwen/components/Color";
import QwenMono from "@lobehub/icons/es/Qwen/components/Mono";
import QwenText from "@lobehub/icons/es/Qwen/components/Text";
import JunieColor from "@lobehub/icons/es/Junie/components/Color";
import JunieMono from "@lobehub/icons/es/Junie/components/Mono";
import JunieText from "@lobehub/icons/es/Junie/components/Text";
import ZAIMono from "@lobehub/icons/es/ZAI/components/Mono";
import ZAIText from "@lobehub/icons/es/ZAI/components/Text";
import type { BadgeIconKey, BadgeIconMode } from "./badges";
import { badgeLabelForIconKey } from "./badges";

type IconProps = {
  size?: string | number;
  color?: string;
  style?: CSSProperties;
  role?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
};

type TextProps = {
  size?: string | number;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
};

type IconComponent = ComponentType<IconProps>;
type TextComponent = ComponentType<TextProps>;
type ImportedIcon = IconComponent | { default: IconComponent };
type ImportedText = TextComponent | { default: TextComponent };

interface BrandAvatarStyle {
  background: string;
  color: string;
  iconMultiple: number;
  shape?: "square" | "circle";
}

interface IconDefinition {
  mono: IconComponent;
  color?: IconComponent;
  text?: TextComponent;
  textMultiple?: number;
  spaceMultiple?: number;
  avatar?: BrandAvatarStyle;
}

function resolveIcon(icon: ImportedIcon): IconComponent {
  return "default" in icon ? icon.default : icon;
}

function resolveText(icon: ImportedText): TextComponent {
  return "default" in icon ? icon.default : icon;
}

const DEFAULT_TEXT_MULTIPLE = 0.76;
const DEFAULT_SPACE_MULTIPLE = 0.24;

const ICONS: Record<Exclude<BadgeIconKey, "custom">, IconDefinition> = {
  anthropic: {
    mono: resolveIcon(AnthropicMono as ImportedIcon),
    text: resolveText(AnthropicText as ImportedText),
  },
  antigravity: {
    mono: resolveIcon(AntigravityMono as ImportedIcon),
    color: resolveIcon(AntigravityColor as ImportedIcon),
    text: resolveText(AntigravityText as ImportedText),
  },
  claude: {
    mono: resolveIcon(ClaudeMono as ImportedIcon),
    color: resolveIcon(ClaudeColor as ImportedIcon),
    text: resolveText(ClaudeText as ImportedText),
    textMultiple: 0.8,
    spaceMultiple: 0.1,
  },
  "claude-code": {
    mono: resolveIcon(ClaudeCodeMono as ImportedIcon),
    color: resolveIcon(ClaudeCodeColor as ImportedIcon),
    text: resolveText(ClaudeCodeText as ImportedText),
    textMultiple: 0.8,
    spaceMultiple: 0.12,
  },
  cline: {
    mono: resolveIcon(ClineMono as ImportedIcon),
    text: resolveText(ClineText as ImportedText),
  },
  kimi: {
    mono: resolveIcon(KimiMono as ImportedIcon),
    color: resolveIcon(KimiColor as ImportedIcon),
    text: resolveText(KimiText as ImportedText),
    textMultiple: 0.7,
    spaceMultiple: 0.25,
    avatar: { background: "#000", color: "#fff", iconMultiple: 0.6, shape: "square" },
  },
  codex: {
    mono: resolveIcon(CodexMono as ImportedIcon),
    color: resolveIcon(CodexColor as ImportedIcon),
    text: resolveText(CodexText as ImportedText),
  },
  copilot: {
    mono: resolveIcon(CopilotMono as ImportedIcon),
    color: resolveIcon(CopilotColor as ImportedIcon),
    text: resolveText(CopilotText as ImportedText),
  },
  cursor: {
    mono: resolveIcon(CursorMono as ImportedIcon),
    text: resolveText(CursorText as ImportedText),
  },
  deepseek: {
    mono: resolveIcon(DeepSeekMono as ImportedIcon),
    color: resolveIcon(DeepSeekColor as ImportedIcon),
    text: resolveText(DeepSeekText as ImportedText),
  },
  doubao: {
    mono: resolveIcon(DoubaoMono as ImportedIcon),
    color: resolveIcon(DoubaoColor as ImportedIcon),
    text: resolveText(DoubaoText as ImportedText),
  },
  gemini: {
    mono: resolveIcon(GeminiMono as ImportedIcon),
    color: resolveIcon(GeminiColor as ImportedIcon),
    text: resolveText(GeminiText as ImportedText),
  },
  "gemini-cli": {
    mono: resolveIcon(GeminiCLIMono as ImportedIcon),
    color: resolveIcon(GeminiCLIColor as ImportedIcon),
    text: resolveText(GeminiCLIText as ImportedText),
  },
  "github-copilot": {
    mono: resolveIcon(GithubCopilotMono as ImportedIcon),
    text: resolveText(GithubCopilotText as ImportedText),
  },
  junie: {
    mono: resolveIcon(JunieMono as ImportedIcon),
    color: resolveIcon(JunieColor as ImportedIcon),
    text: resolveText(JunieText as ImportedText),
  },
  grok: {
    mono: resolveIcon(GrokMono as ImportedIcon),
    text: resolveText(GrokText as ImportedText),
  },
  minimax: {
    mono: resolveIcon(MinimaxMono as ImportedIcon),
    color: resolveIcon(MinimaxColor as ImportedIcon),
    text: resolveText(MinimaxText as ImportedText),
  },
  moonshot: {
    mono: resolveIcon(MoonshotMono as ImportedIcon),
    text: resolveText(MoonshotText as ImportedText),
  },
  openai: {
    mono: resolveIcon(OpenAIMono as ImportedIcon),
    text: resolveText(OpenAIText as ImportedText),
  },
  opencode: {
    mono: resolveIcon(OpenCodeMono as ImportedIcon),
    text: resolveText(OpenCodeText as ImportedText),
  },
  qwen: {
    mono: resolveIcon(QwenMono as ImportedIcon),
    color: resolveIcon(QwenColor as ImportedIcon),
    text: resolveText(QwenText as ImportedText),
  },
  "z-ai": {
    mono: resolveIcon(ZAIMono as ImportedIcon),
    text: resolveText(ZAIText as ImportedText),
  },
  chatgpt: {
    mono: resolveIcon(OpenAIMono as ImportedIcon),
    text: resolveText(OpenAIText as ImportedText),
  },
};

export interface InlineBadgeIconProps {
  iconKey: BadgeIconKey;
  mode: BadgeIconMode;
  color: string;
  size: number;
  opacity?: number;
  label?: string;
}

function CustomBadgeGlyph({
  size,
  color,
  opacity = 1,
  label = "Custom",
}: Pick<InlineBadgeIconProps, "size" | "color" | "opacity" | "label">) {
  return (
    <svg
      aria-label={`${label} icon`}
      role="img"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ color, flex: "none", opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{label}</title>
      <path
        d="M12 2.5l2.08 6.1 6.42.06-5.16 3.8 1.93 6.14L12 14.9 6.73 18.6l1.93-6.14-5.16-3.8 6.42-.06L12 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function BrandIconGlyph({
  Icon,
  avatar,
  size,
}: {
  Icon: IconComponent;
  avatar?: BrandAvatarStyle;
  size: number;
}) {
  if (!avatar) {
    return <Icon aria-hidden size={size} style={{ flex: "none", lineHeight: 1 }} />;
  }

  const radius = avatar.shape === "circle" ? "50%" : Math.floor(size * 0.1);

  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        borderRadius: radius,
        background: avatar.background,
        color: avatar.color,
        overflow: "hidden",
      }}
    >
      <Icon
        aria-hidden
        size={size}
        color={avatar.color}
        style={{
          flex: "none",
          lineHeight: 1,
          transform: `scale(${avatar.iconMultiple})`,
        }}
      />
    </span>
  );
}

function CombinedBrandMark({
  iconKey,
  icon,
  color,
  size,
  opacity,
  title,
}: {
  iconKey: BadgeIconKey;
  icon: IconDefinition;
  color: string;
  size: number;
  opacity: number;
  title: string;
}) {
  const Icon = icon.color ?? icon.mono;
  const Text = icon.text;
  const textSize = Math.round(size * (icon.textMultiple ?? DEFAULT_TEXT_MULTIPLE));
  const gap = Math.max(2, Math.round(size * (icon.spaceMultiple ?? DEFAULT_SPACE_MULTIPLE)));

  return (
    <span
      aria-label={`${title} icon`}
      data-badge-icon-combine={iconKey}
      role="img"
      style={{
        display: "inline-flex",
        alignItems: "center",
        flex: "none",
        gap,
        color,
        lineHeight: 1,
        opacity,
      }}
    >
      <BrandIconGlyph Icon={Icon} avatar={icon.avatar} size={size} />
      {Text ? (
        <Text
          aria-hidden
          size={textSize}
          style={{
            flex: "none",
            lineHeight: 1,
            maxWidth: size * 5.8,
            overflow: "hidden",
          }}
        />
      ) : null}
    </span>
  );
}

export function badgeUsesCombinedBrandMark(
  iconKey: BadgeIconKey,
  mode: BadgeIconMode,
): boolean {
  return iconKey !== "custom" && mode === "brand" && Boolean(ICONS[iconKey].text);
}

export function InlineBadgeIcon({
  iconKey,
  mode,
  color,
  size,
  opacity = 1,
  label,
}: InlineBadgeIconProps) {
  if (iconKey === "custom") {
    return (
      <CustomBadgeGlyph
        size={size}
        color={color}
        opacity={opacity}
        label={label ?? "Custom"}
      />
    );
  }

  const icon = ICONS[iconKey];
  const title = label ?? badgeLabelForIconKey(iconKey);

  if (mode === "brand" && icon.text) {
    return (
      <CombinedBrandMark
        iconKey={iconKey}
        icon={icon}
        color={color}
        size={size}
        opacity={opacity}
        title={title}
      />
    );
  }

  const Svg = icon.mono;

  return (
    <Svg
      aria-label={`${title} icon`}
      role="img"
      size={size}
      style={{
        color,
        flex: "none",
        lineHeight: 1,
        opacity,
      }}
    />
  );
}
