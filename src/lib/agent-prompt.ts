import type { OverlayState } from "../types";
import { projectConfigText } from "./session-config-drift";

/*
 * Compose a copy-paste prompt that hands the current config off to an external
 * AI tool, asking it to return an updated v1 `live-session.config.json`.
 *
 * This is pure string composition — no network, no LLM call, no dependency.
 * The user copies the result, runs it in their own AI tool, then imports the
 * returned JSON via the Config · JSON view (which never auto-applies).
 */
export function buildAgentPrompt(state: OverlayState, brief: string): string {
  const config = projectConfigText(state).trim();
  const trimmedBrief = brief.trim() || "(none)";
  return [
    "You are preparing live-session.config.json (v1) for a livestream config center.",
    "Return ONLY valid JSON matching this shape:",
    "{ version: 1, title, subtitle, author?, profile { avatarUrl, avatarVisible },",
    "  cover { visual, portraitUrl, sceneUrl }, badges: string[], stack: string[],",
    "  socials: [{ icon?, label, value, color? }], sections: [{ title, bullets: string[] }] }",
    "Do NOT include runtime fields: bottomBar, liveSession.startedAt, activeSection, sectionsDone.",
    "",
    `Brief: ${trimmedBrief}`,
    "",
    "Current config (edit this, keep version: 1):",
    config,
  ].join("\n");
}
