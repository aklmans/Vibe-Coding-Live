import type { ReactNode } from "react";
import { UI_COLORS } from "../../lib/design-tokens";
import { useLocale } from "../../hooks/useLocale";
import { FieldLine } from "../inspector/EditorRow";
import { TextInput } from "./Field";

export interface IconSearchPickerOption {
  id: string;
  label: string;
  metaLabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
  testId?: string;
}

export interface IconSearchPickerPreset {
  id: string;
  label: string;
  disabled?: boolean;
}

interface IconSearchPickerProps {
  testIdPrefix: string;
  query: string;
  onQueryChange: (query: string) => void;
  placeholder: string;
  options: IconSearchPickerOption[];
  presets?: IconSearchPickerPreset[];
  searchLabel?: string;
  onSelectOption: (option: IconSearchPickerOption) => void;
  onSelectPreset?: (preset: IconSearchPickerPreset) => void;
}

export default function IconSearchPicker({
  testIdPrefix,
  query,
  onQueryChange,
  placeholder,
  options,
  presets = [],
  searchLabel,
  onSelectOption,
  onSelectPreset,
}: IconSearchPickerProps) {
  const { t } = useLocale();
  const enabledOptions = options.filter((option) => !option.disabled);

  return (
    <div
      data-testid={`${testIdPrefix}-icon-picker`}
      style={{
        paddingTop: 12,
        borderTop: `1px solid ${UI_COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {presets.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--app-font-mono)",
              fontSize: 10,
              fontWeight: 650,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: UI_COLORS.textMuted,
            }}
          >
            {t("badge.presets")}
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              borderTop: `1px solid ${UI_COLORS.border}`,
              borderBottom: `1px solid ${UI_COLORS.border}`,
            }}
          >
            {presets.map((preset, i) => (
              <button
                key={preset.id}
                data-testid={`${testIdPrefix}-preset-${preset.id}`}
                disabled={preset.disabled}
                onClick={() => onSelectPreset?.(preset)}
                style={{
                  minWidth: 0,
                  padding: "8px 8px 7px",
                  border: "none",
                  borderRight: i % 2 === 0 ? `1px solid ${UI_COLORS.border}` : "none",
                  borderBottom:
                    i < presets.length - 2 ? `1px solid ${UI_COLORS.border}` : "none",
                  background: "transparent",
                  color: preset.disabled ? UI_COLORS.textSubtle : UI_COLORS.textSoft,
                  opacity: preset.disabled ? 0.48 : 1,
                  cursor: preset.disabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                  fontFamily: "var(--app-font-mono)",
                  fontSize: 10,
                  fontWeight: 650,
                  letterSpacing: "0.035em",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <FieldLine label={searchLabel ?? t("label.search")}>
        <TextInput
          testId={`${testIdPrefix}-add-search`}
          value={query}
          onChange={onQueryChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && enabledOptions[0]) {
              e.preventDefault();
              onSelectOption(enabledOptions[0]);
            }
          }}
          placeholder={placeholder}
          mono
        />
      </FieldLine>

      <div
        data-testid={`${testIdPrefix}-add-options`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          borderTop: `1px solid ${UI_COLORS.border}`,
          borderBottom: `1px solid ${UI_COLORS.border}`,
        }}
      >
        {options.map((option, i) => {
          const addLabel = `${t("btn.add")} ${option.label}`;
          return (
            <button
              key={option.id}
              data-testid={option.testId ?? `${testIdPrefix}-add-${option.id}`}
              disabled={option.disabled}
              onClick={() => onSelectOption(option)}
              title={addLabel}
              aria-label={addLabel}
              style={{
                minWidth: 0,
                display: "grid",
                gridTemplateColumns: "18px minmax(0, 1fr) 18px",
                alignItems: "center",
                gap: 8,
                padding: "8px 8px 7px",
                border: "none",
                borderRight: i % 2 === 0 ? `1px solid ${UI_COLORS.border}` : "none",
                borderBottom:
                  i < options.length - 2 ? `1px solid ${UI_COLORS.border}` : "none",
                background: "transparent",
                color: option.disabled ? UI_COLORS.textSubtle : UI_COLORS.textMuted,
                opacity: option.disabled ? 0.45 : 1,
                cursor: option.disabled ? "not-allowed" : "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {option.icon ?? (
                  <span
                    aria-hidden="true"
                    style={{
                      width: 9,
                      height: 9,
                      borderLeft: `2px solid ${UI_COLORS.accent}`,
                    }}
                  />
                )}
              </span>
              <span
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "var(--app-font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    color: UI_COLORS.textSoft,
                  }}
                >
                  {option.label}
                </span>
                {option.metaLabel && (
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: "var(--app-font-mono)",
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: UI_COLORS.textSubtle,
                    }}
                  >
                    {option.metaLabel}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                style={{
                  color: option.disabled ? UI_COLORS.textSubtle : UI_COLORS.accentText,
                  fontFamily: "var(--app-font-mono)",
                  fontSize: 14,
                  lineHeight: 1,
                  textAlign: "center",
                }}
              >
                +
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
