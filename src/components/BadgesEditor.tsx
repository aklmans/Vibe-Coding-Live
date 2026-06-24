import { useMemo, useState } from "react";
import type { OverlayState } from "../types";
import { patchSection } from "../lib/state";
import {
  BADGE_ICON_REGISTRY,
  searchBadgeIcons,
  type BadgeConfig,
  type BadgeIconKey,
  type BadgeIconMode,
} from "../lib/badges";
import {
  BADGE_PRESETS,
  addBadgePreset,
  moveVisibleBadge,
} from "../lib/badge-editor";
import { UI_COLORS } from "../lib/design-tokens";
import type { TranslationKey } from "../lib/i18n";
import { useLocale } from "../hooks/useLocale";
import { TextInput } from "./shared/Field";
import { EditorRow, FieldLine, LineSegmented } from "./inspector/EditorRow";
import { BadgeIcon } from "./shared/BadgeIcon";
import IconSearchPicker, { type IconSearchPickerOption, type IconSearchPickerPreset } from "./shared/IconSearchPicker";

interface BadgesEditorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
  testIdPrefix?: string;
}

type VisibleBadge = {
  badge: BadgeConfig;
  originalIndex: number;
};

/**
 * Editor for the agent badges shown on Cover/Poster top toolbar. Badges now
 * behave like a compact added list: edit the active rows, remove what is not
 * needed, and search the registry once at the bottom to append more.
 */
export default function BadgesEditor({
  state,
  onChange,
  testIdPrefix = "badge",
}: BadgesEditorProps) {
  const { t } = useLocale();
  const [addQuery, setAddQuery] = useState("");

  const iconModeOptions: { value: BadgeIconMode; label: string }[] = [
    { value: "mono", label: t("badge.mode.mono") },
    { value: "brand", label: t("badge.mode.brand") },
  ];

  const visibleBadges = state.cover.badges.reduce<VisibleBadge[]>(
    (items, badge, originalIndex) => {
      if (badge.visible) items.push({ badge, originalIndex });
      return items;
    },
    [],
  );

  const usedIconKeys = useMemo(
    () =>
      new Set(
        state.cover.badges
          .filter((badge) => badge.visible)
          .map((badge) => badge.iconKey),
      ),
    [state.cover.badges],
  );

  const writeBadges = (badges: BadgeConfig[]) => {
    onChange(patchSection(state, "cover", { badges }));
  };

  const updateBadge = (idx: number, patch: Partial<BadgeConfig>) => {
    writeBadges(
      state.cover.badges.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    );
  };

  const removeBadge = (idx: number) => {
    writeBadges(state.cover.badges.filter((_, i) => i !== idx));
  };

  const moveBadge = (visibleIndex: number, direction: -1 | 1) => {
    writeBadges(moveVisibleBadge(state.cover.badges, visibleIndex, direction));
  };

  const addBadge = (iconKey: BadgeIconKey) => {
    if (usedIconKeys.has(iconKey)) return;
    writeBadges(addBadgePreset(state.cover.badges, [iconKey]));
    setAddQuery("");
  };

  const addPreset = (keys: readonly BadgeIconKey[]) => {
    writeBadges(addBadgePreset(state.cover.badges, keys));
    setAddQuery("");
  };

  const addOptions = useMemo(
    () =>
      searchBadgeIcons(addQuery)
        .filter((meta) => !usedIconKeys.has(meta.iconKey))
        .slice(0, 8),
    [addQuery, usedIconKeys],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {visibleBadges.map(({ badge, originalIndex }, visibleIndex) => {
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
            key={`${badge.iconKey}-${originalIndex}`}
            index={visibleIndex + 1}
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
                  {badge.label || label || `${t("label.badge")} ${visibleIndex + 1}`}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <BadgeToolButton
                  testId={`${testIdPrefix}-${visibleIndex}-move-up`}
                  label={t("btn.moveUp")}
                  glyph="↑"
                  disabled={visibleIndex === 0}
                  onClick={() => moveBadge(visibleIndex, -1)}
                />
                <BadgeToolButton
                  testId={`${testIdPrefix}-${visibleIndex}-move-down`}
                  label={t("btn.moveDown")}
                  glyph="↓"
                  disabled={visibleIndex === visibleBadges.length - 1}
                  onClick={() => moveBadge(visibleIndex, 1)}
                />
                <BadgeToolButton
                  testId={`${testIdPrefix}-${visibleIndex}-remove`}
                  label={t("btn.remove")}
                  glyph="×"
                  danger
                  onClick={() => removeBadge(originalIndex)}
                />
              </div>
            }
          >
            <LineSegmented
              active={badge.iconMode}
              onSelect={(value) =>
                updateBadge(originalIndex, { iconMode: value as BadgeIconMode })
              }
              options={iconModeOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
                testId: `${testIdPrefix}-${visibleIndex}-mode-${opt.value}`,
              }))}
            />

            <FieldLine label={t("label.displayLabel")}>
              <TextInput
                testId={`${testIdPrefix}-${visibleIndex}-label`}
                value={badge.label}
                onChange={(label) => updateBadge(originalIndex, { label })}
                placeholder={t("label.displayLabel")}
              />
            </FieldLine>
          </EditorRow>
        );
      })}

      {visibleBadges.length === 0 && (
        <div
          data-testid={`${testIdPrefix}-empty-hint`}
          style={{
            padding: "12px 0",
            borderTop: `1px solid ${UI_COLORS.border}`,
            fontFamily: "var(--app-font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            lineHeight: 1.6,
            color: UI_COLORS.textMuted,
          }}
        >
          {t("badge.empty")}
        </div>
      )}

      <IconSearchPicker
        testIdPrefix={testIdPrefix}
        query={addQuery}
        onQueryChange={setAddQuery}
        placeholder={t("badge.searchPlaceholder")}
        presets={BADGE_PRESETS.map((preset): IconSearchPickerPreset => ({
          id: preset.id,
          label: preset.label,
          disabled: preset.keys.every((key) => usedIconKeys.has(key)),
        }))}
        options={addOptions.map((meta): IconSearchPickerOption => ({
          id: meta.iconKey,
          label: meta.label,
          metaLabel: t(`badge.category.${meta.category}` as TranslationKey),
          icon: (
            <BadgeIcon
              iconKey={meta.iconKey}
              mode="mono"
              color={UI_COLORS.textMuted}
              size={15}
              label={meta.label}
            />
          ),
        }))}
        onSelectPreset={(preset) => {
          const found = BADGE_PRESETS.find((item) => item.id === preset.id);
          if (found) addPreset(found.keys);
        }}
        onSelectOption={(option) => addBadge(option.id as BadgeIconKey)}
      />
    </div>
  );
}

function BadgeToolButton({
  testId,
  label,
  glyph,
  disabled = false,
  danger = false,
  onClick,
}: {
  testId: string;
  label: string;
  glyph: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      style={{
        width: 26,
        minWidth: 26,
        height: 30,
        minHeight: 30,
        border: "none",
        background: "transparent",
        color: disabled ? UI_COLORS.textSubtle : UI_COLORS.textMuted,
        opacity: disabled ? 0.38 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--app-font-mono)",
        fontSize: 14,
        fontWeight: 650,
        lineHeight: 1,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.12s, opacity 0.12s",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLElement).style.color = danger
          ? UI_COLORS.danger
          : UI_COLORS.accentText;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = disabled
          ? UI_COLORS.textSubtle
          : UI_COLORS.textMuted;
      }}
    >
      {glyph}
    </button>
  );
}
