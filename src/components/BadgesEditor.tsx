import { useMemo, useState } from "react";
import type { OverlayState } from "../types";
import { patchSection } from "../lib/state";
import {
  BADGE_ICON_REGISTRY,
  badgeLabelForIconKey,
  searchBadgeIcons,
  type BadgeConfig,
  type BadgeIconKey,
  type BadgeIconMode,
} from "../lib/badges";
import { UI_COLORS } from "../lib/design-tokens";
import type { TranslationKey } from "../lib/i18n";
import { useLocale } from "../hooks/useLocale";
import { TextInput, ToggleButton } from "./shared/Field";
import { EditorRow, FieldLine, LineSegmented } from "./inspector/EditorRow";
import { BadgeIcon } from "./shared/BadgeIcon";

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
  const [queries, setQueries] = useState<Record<number, string>>({});

  const iconModeOptions: { value: BadgeIconMode; label: string }[] = [
    { value: "mono", label: t("badge.mode.mono") },
    { value: "brand", label: t("badge.mode.brand") },
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
        const query = queries[idx] ?? "";
        const iconOptions = searchBadgeIcons(query);
        const label =
          badge.iconKey === "custom"
            ? badge.label || t("badge.custom")
            : BADGE_ICON_REGISTRY[badge.iconKey]?.label ?? badge.label;
        const categoryLabel =
          badge.iconKey === "custom"
            ? t("badge.category.custom")
            : t(
                `badge.category.${BADGE_ICON_REGISTRY[badge.iconKey].category}` as TranslationKey,
              );

        return (
          <EditorRow
            key={idx}
            index={idx + 1}
            dimmed={!badge.visible}
            title={
              <>
                <BadgeIcon
                  iconKey={badge.iconKey}
                  mode="mono"
                  color={UI_COLORS.textSoft}
                  size={16}
                  label={label}
                />
                <span
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {badge.label || `${t("label.badge")} ${idx + 1}`}
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: "var(--app-font-mono)",
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: UI_COLORS.textSubtle,
                    textTransform: "uppercase",
                  }}
                >
                  {categoryLabel}
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
            <FieldLine label={t("label.search")}>
              <TextInput
                testId={`${testIdPrefix}-${idx}-icon-search`}
                value={query}
                onChange={(value) =>
                  setQueries((current) => ({ ...current, [idx]: value }))
                }
                placeholder={t("badge.searchPlaceholder")}
                mono
              />
            </FieldLine>

            <BadgeIconChooser
              active={badge.iconKey}
              options={iconOptions}
              testIdPrefix={`${testIdPrefix}-${idx}`}
              onSelect={(iconKey) => {
                updateBadge(idx, {
                  iconKey,
                  label: badgeLabelForIconKey(iconKey, badge.label),
                  customIconUrl: "",
                });
                setQueries((current) => ({ ...current, [idx]: "" }));
              }}
            />

            <LineSegmented
              active={badge.iconMode}
              onSelect={(value) =>
                updateBadge(idx, { iconMode: value as BadgeIconMode })
              }
              options={iconModeOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
                testId: `${testIdPrefix}-${idx}-mode-${opt.value}`,
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
          </EditorRow>
        );
      })}
    </div>
  );
}

function BadgeIconChooser({
  active,
  options,
  testIdPrefix,
  onSelect,
}: {
  active: BadgeIconKey;
  options: ReturnType<typeof searchBadgeIcons>;
  testIdPrefix: string;
  onSelect: (iconKey: BadgeIconKey) => void;
}) {
  const visibleOptions = useMemo(() => options.slice(0, 8), [options]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        borderTop: `1px solid ${UI_COLORS.border}`,
        borderBottom: `1px solid ${UI_COLORS.border}`,
      }}
    >
      {visibleOptions.map((meta, i) => {
        const isActive = meta.iconKey === active;
        return (
          <button
            key={meta.iconKey}
            data-testid={`${testIdPrefix}-icon-${meta.iconKey}`}
            onClick={() => onSelect(meta.iconKey)}
            style={{
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 8px 7px",
              border: "none",
              borderRight:
                i % 2 === 0 ? `1px solid ${UI_COLORS.border}` : "none",
              borderBottom:
                i < visibleOptions.length - 2
                  ? `1px solid ${UI_COLORS.border}`
                  : "none",
              background: "transparent",
              boxShadow: isActive
                ? `inset 2px 0 0 ${UI_COLORS.accent}`
                : "none",
              color: isActive ? UI_COLORS.text : UI_COLORS.textMuted,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <BadgeIcon
              iconKey={meta.iconKey}
              mode="mono"
              color={isActive ? UI_COLORS.accent : UI_COLORS.textMuted}
              size={15}
              label={meta.label}
            />
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                fontFamily: "var(--app-font-mono)",
                fontSize: 10,
                fontWeight: isActive ? 650 : 500,
                letterSpacing: "0.04em",
              }}
            >
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
