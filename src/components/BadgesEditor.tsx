import type { OverlayState } from "../types";
import { patchSection } from "../lib/state";
import {
  BADGE_PRESETS,
  type BadgeConfig,
  type BadgeKind,
} from "../lib/badges";
import { UI_COLORS } from "../lib/design-tokens";
import { useLocale } from "../hooks/useLocale";
import { TextInput, ToggleButton } from "./shared/Field";
import { EditorRow, FieldLine, LineSegmented } from "./inspector/EditorRow";

interface BadgesEditorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
  testIdPrefix?: string;
}

/**
 * Editor for the agent badges shown on Cover/Poster top toolbar. A ruled
 * spec-sheet list: index gutter + live icon/label identity + visibility on the
 * right, with the kind picker and label/icon inputs aligned into stable columns
 * below. No per-item cards. Used by both the Cover and Poster tabs.
 */
export default function BadgesEditor({
  state,
  onChange,
  testIdPrefix = "badge",
}: BadgesEditorProps) {
  const { t } = useLocale();
  const KIND_OPTIONS: { value: BadgeKind; label: string }[] = [
    { value: "claude", label: t("badge.claude") },
    { value: "codex", label: t("badge.codex") },
    { value: "gemini", label: t("badge.gemini") },
    { value: "grok", label: t("badge.grok") },
    { value: "custom", label: t("badge.custom") },
  ];

  const updateBadge = (idx: number, patch: Partial<BadgeConfig>) => {
    const badges = state.cover.badges.map((b, i) =>
      i === idx ? { ...b, ...patch } : b,
    );
    onChange(patchSection(state, "cover", { badges }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {state.cover.badges.map((badge, idx) => {
        const presetIcon =
          badge.kind === "custom"
            ? badge.customIconUrl
            : BADGE_PRESETS[badge.kind]?.iconUrl ?? "";
        return (
          <EditorRow
            key={idx}
            index={idx + 1}
            dimmed={!badge.visible}
            title={
              <>
                {presetIcon ? (
                  <img
                    src={presetIcon}
                    alt=""
                    style={{
                      width: 16,
                      height: 16,
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <span
                    aria-hidden
                    style={{
                      width: 16,
                      textAlign: "center",
                      color: UI_COLORS.textSubtle,
                      fontSize: 11,
                      flexShrink: 0,
                    }}
                  >
                    —
                  </span>
                )}
                <span
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {badge.label || `${t("label.badge")} ${idx + 1}`}
                </span>
              </>
            }
            action={
              <ToggleButton
                label=""
                checked={badge.visible}
                onChange={(visible) => updateBadge(idx, { visible })}
                testId={`${testIdPrefix}-${idx}-visible`}
              />
            }
          >
            <LineSegmented
              active={badge.kind}
              onSelect={(value) => {
                const kind = value as BadgeKind;
                const patch: Partial<BadgeConfig> = { kind };
                if (kind !== "custom") {
                  patch.label = BADGE_PRESETS[kind].label;
                }
                updateBadge(idx, patch);
              }}
              options={KIND_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
                testId: `${testIdPrefix}-${idx}-kind-${opt.value}`,
              }))}
            />

            <FieldLine label={t("label.displayLabel")}>
              <TextInput
                testId={`${testIdPrefix}-${idx}-label`}
                value={badge.label}
                onChange={(label) => updateBadge(idx, { label })}
                placeholder={t("label.displayLabel")}
              />
            </FieldLine>

            {badge.kind === "custom" && (
              <FieldLine label={t("label.iconUrl")}>
                <TextInput
                  testId={`${testIdPrefix}-${idx}-icon-url`}
                  value={badge.customIconUrl}
                  onChange={(customIconUrl) =>
                    updateBadge(idx, { customIconUrl })
                  }
                  placeholder="https://…"
                  mono
                />
              </FieldLine>
            )}
          </EditorRow>
        );
      })}
    </div>
  );
}
