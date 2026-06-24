import type { OverlayState } from "../types";
import { createBadge } from "./badge-editor";
import {
  isBadgeIconKey,
  searchBadgeIcons,
  type BadgeIconKey,
} from "./badges";
import type { Locale } from "./i18n";
import { inferBrandIconKey } from "./brand-icons";
import { createStackItem } from "./stack";
import { parseSessionRecipe } from "./session-recipe";

export interface LiveBriefSection {
  title: string;
  bullets: string[];
}

export interface LiveBriefDraft {
  title: string;
  topic: string;
  sections: LiveBriefSection[];
  stackItems: string[];
  badgeKeys: BadgeIconKey[];
}

const SECTION_TITLES: Record<Locale, [string, string, string]> = {
  zh: ["今日目标", "当前问题", "输出记录"],
  en: ["Today's Goal", "Current Problem", "Session Log"],
};

const FALLBACK_TASKS: Record<Locale, [string, string, string]> = {
  zh: ["明确直播目标", "梳理关键步骤", "验证输出效果"],
  en: ["Define the stream goal", "Shape the key steps", "Verify the output"],
};

const PROBLEM_PROMPTS: Record<Locale, [string, string, string]> = {
  zh: ["哪一步最卡？", "如何更简单？", "下一步测什么？"],
  en: ["Where is the bottleneck?", "How can it be simpler?", "What should we test next?"],
};

const LOG_PROMPTS: Record<Locale, [string, string, string]> = {
  zh: ["已生成直播草稿", "已确认工具栈", "准备开播验证"],
  en: ["Drafted the stream plan", "Confirmed the tool stack", "Ready to verify on air"],
};

export function generateLiveBriefDraft(input: string, locale: Locale): LiveBriefDraft {
  const recipe = parseSessionRecipe(input, locale);
  const explicitTitle = extractField(input, ["标题", "title"]);
  const explicitTopic = extractField(input, ["目标", "goal"]);
  const taskBullets = normalizeBullets(recipe.tasks, FALLBACK_TASKS[locale]);
  const stackItems = recipe.stackItems.map(cleanBriefValue).filter(Boolean).slice(0, 6);
  const badgeKeys = inferBadgeKeys(stackItems);
  const [goalTitle, problemTitle, logTitle] = SECTION_TITLES[locale];

  return {
    title: explicitTitle || recipe.title,
    topic: explicitTopic || recipe.goal || explicitTitle || recipe.title,
    sections: [
      {
        title: goalTitle,
        bullets: taskBullets,
      },
      {
        title: problemTitle,
        bullets: [...PROBLEM_PROMPTS[locale]],
      },
      {
        title: logTitle,
        bullets: [...LOG_PROMPTS[locale]],
      },
    ],
    stackItems,
    badgeKeys,
  };
}

export function applyLiveBriefDraftToOverlayState(
  state: OverlayState,
  draft: LiveBriefDraft,
): OverlayState {
  const sections = draft.sections.map((section) => ({
    title: section.title,
    bullets: section.bullets,
  }));

  return {
    ...state,
    sidebar: {
      ...state.sidebar,
      activeSection: 0,
      sections,
      sectionsDone: sections.map((section) => section.bullets.map(() => false)),
    },
    stack: {
      ...state.stack,
      items: draft.stackItems.length > 0
        ? draft.stackItems.map((label) => createStackItem(label))
        : state.stack.items,
    },
    cover: {
      ...state.cover,
      title: draft.title || state.cover.title,
      todayTopic: draft.topic || state.cover.todayTopic,
      badges: draft.badgeKeys.length > 0
        ? draft.badgeKeys.map((key) => createBadge(key))
        : state.cover.badges,
    },
  };
}

export function formatLiveBriefDraftJson(draft: LiveBriefDraft): string {
  return `${JSON.stringify(draft, null, 2)}\n`;
}

export function parseLiveBriefDraftJson(input: string): LiveBriefDraft | null {
  try {
    const source = JSON.parse(input) as Partial<LiveBriefDraft>;
    if (!source || typeof source !== "object") return null;
    const title = typeof source.title === "string" ? source.title.trim() : "";
    const topic = typeof source.topic === "string" ? source.topic.trim() : "";
    const sections = Array.isArray(source.sections)
      ? source.sections
          .map((section) => normalizeSection(section))
          .filter((section): section is LiveBriefSection => Boolean(section))
      : [];
    const stackItems = Array.isArray(source.stackItems)
      ? source.stackItems
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    const rawBadgeKeys: unknown[] = Array.isArray(source.badgeKeys)
      ? source.badgeKeys
      : [];
    const badgeKeys = rawBadgeKeys.filter(isBadgeIconKey);
    if (!title || !topic || sections.length === 0) return null;
    return {
      title,
      topic,
      sections,
      stackItems,
      badgeKeys,
    };
  } catch {
    return null;
  }
}

function normalizeBullets(
  bullets: readonly string[],
  fallback: readonly [string, string, string],
): string[] {
  const next = bullets.map((bullet) => bullet.trim()).filter(Boolean).slice(0, 3);
  while (next.length < 3) {
    next.push(fallback[next.length] ?? fallback[0]);
  }
  return next;
}

function cleanBriefValue(value: string): string {
  return value.trim().replace(/[。.;；]+$/g, "").trim();
}

function extractField(input: string, labels: readonly string[]): string {
  const escaped = labels.map((label) => escapeRegExp(label)).join("|");
  const match = input.match(
    new RegExp(`(?:^|[\\s。；;])(?:${escaped})\\s*[:：]\\s*([^。；;\\n.]+)`, "i"),
  );
  return (match?.[1] ?? "").trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferBadgeKeys(stackItems: readonly string[]): BadgeIconKey[] {
  const seen = new Set<BadgeIconKey>();
  const keys: BadgeIconKey[] = [];

  for (const label of stackItems) {
    const brandKey = inferBrandIconKey(label);
    const key = brandKey && isBadgeIconKey(brandKey)
      ? brandKey
      : searchBadgeIcons(label)[0]?.iconKey;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    keys.push(key);
    if (keys.length >= 4) break;
  }

  return keys;
}

function normalizeSection(source: unknown): LiveBriefSection | null {
  if (!source || typeof source !== "object") return null;
  const section = source as Partial<LiveBriefSection>;
  const title = typeof section.title === "string" ? section.title.trim() : "";
  const bullets = Array.isArray(section.bullets)
    ? section.bullets
        .filter((bullet): bullet is string => typeof bullet === "string")
        .map((bullet) => bullet.trim())
        .filter(Boolean)
    : [];
  if (!title || bullets.length === 0) return null;
  return { title, bullets };
}
