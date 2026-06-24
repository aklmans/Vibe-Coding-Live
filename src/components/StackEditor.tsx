import { useMemo, useState } from "react";
import type { OverlayState } from "../types";
import { UI_COLORS } from "../lib/design-tokens";
import { patchSection } from "../lib/state";
import {
  BRAND_ICON_REGISTRY,
  searchBrandIcons,
  type BrandIconKey,
  type BrandIconMode,
} from "../lib/brand-icons";
import {
  createStackItem,
  type StackItem,
} from "../lib/stack";
import { useLocale } from "../hooks/useLocale";
import { TextInput } from "./shared/Field";
import { BrandIcon } from "./shared/BrandIcon";
import { EditorRow, FieldLine, LineSegmented } from "./inspector/EditorRow";

interface StackEditorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
}

/**
 * Icon-backed editor for the bottom-bar tool stack. It stays compact like the
 * old add-list, but new entries can be selected from a simple-icons registry.
 */
export default function StackEditor({ state, onChange }: StackEditorProps) {
  const { t } = useLocale();
  const [draft, setDraft] = useState("");

  const writeItems = (items: StackItem[]) => {
    onChange(patchSection(state, "stack", { items }));
  };

  const updateItem = (idx: number, patch: Partial<StackItem>) => {
    writeItems(state.stack.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const removeItem = (idx: number) => {
    writeItems(state.stack.items.filter((_, i) => i !== idx));
  };

  const addTextItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    writeItems([...state.stack.items, createStackItem(trimmed)]);
    setDraft("");
  };

  const addIconItem = (iconKey: BrandIconKey) => {
    const meta = BRAND_ICON_REGISTRY[iconKey];
    writeItems([...state.stack.items, createStackItem(meta.label, iconKey)]);
    setDraft("");
  };

  const addOptions = useMemo(
    () => searchBrandIcons(draft).slice(0, 6),
    [draft],
  );

  const iconModeOptions: { value: BrandIconMode; label: string }[] = [
    { value: "mono", label: t("badge.mode.mono") },
    { value: "brand", label: t("badge.mode.brand") },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {state.stack.items.map((item, idx) => (
        <EditorRow
          key={`${item.label}-${idx}`}
          index={idx + 1}
          testId={`stack-row-${idx}`}
          title={
            <>
              <BrandIcon
                iconKey={item.iconKey}
                mode="mono"
                color={UI_COLORS.textSoft}
                size={16}
                label={item.label}
                style={{ opacity: item.iconKey ? 1 : 0.45 }}
              />
              <span
                data-testid={`stack-item-${idx}-icon`}
                style={{
                  width: item.iconKey ? 0 : 16,
                  height: 16,
                  flexShrink: 0,
                  borderLeft: item.iconKey ? "none" : `2px solid ${UI_COLORS.rule}`,
                }}
              />
              <span
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {item.label}
              </span>
            </>
          }
          action={
            <button
              data-testid={`stack-remove-${idx}`}
              onClick={() => removeItem(idx)}
              title={t("btn.remove")}
              aria-label={t("btn.remove")}
              style={{
                // A bare tool glyph, not a boxed button — hairline editing rhythm.
                width: 30,
                minWidth: 30,
                height: 30,
                minHeight: 30,
                border: "none",
                background: "transparent",
                color: UI_COLORS.textSubtle,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 16,
                lineHeight: 1,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = UI_COLORS.danger;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = UI_COLORS.textSubtle;
              }}
            >
              ×
            </button>
          }
        >
          {item.iconKey && (
            <LineSegmented
              active={item.iconMode}
              onSelect={(value) => updateItem(idx, { iconMode: value as BrandIconMode })}
              options={iconModeOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
                testId: `stack-item-${idx}-mode-${opt.value}`,
              }))}
            />
          )}
          <FieldLine label={t("label.displayLabel")}>
            <TextInput
              testId={`stack-item-${idx}`}
              value={item.label}
              onChange={(label) => updateItem(idx, { label })}
              style={{ flex: 1 }}
            />
          </FieldLine>
        </EditorRow>
      ))}

      <div
        style={{
          paddingTop: 12,
          borderTop: `1px solid ${UI_COLORS.border}`,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <FieldLine label={t("label.search")}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <TextInput
              testId="stack-add-search"
              value={draft}
              onChange={setDraft}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (addOptions[0]) addIconItem(addOptions[0].iconKey);
                  else addTextItem();
                }
              }}
              placeholder={t("stackEditor.placeholder")}
              style={{ flex: 1, borderStyle: "dashed" }}
            />
            <button
              data-testid="stack-add"
              onClick={addTextItem}
              disabled={!draft.trim()}
              title={t("btn.add")}
              aria-label={t("btn.add")}
              style={{
                // Matching bare "+" tool glyph: the single accent only when armed.
                width: 30,
                minWidth: 30,
                height: 30,
                minHeight: 30,
                border: "none",
                background: "transparent",
                color: draft.trim() ? UI_COLORS.accentText : UI_COLORS.textSubtle,
                cursor: draft.trim() ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                fontSize: 18,
                lineHeight: 1,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.12s",
              }}
            >
              +
            </button>
          </div>
        </FieldLine>

        {addOptions.length > 0 && (
          <div
            data-testid="stack-add-options"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 6,
            }}
          >
            {addOptions.map((meta) => (
              <button
                key={meta.iconKey}
                data-testid={`stack-add-option-${meta.iconKey}`}
                onClick={() => addIconItem(meta.iconKey)}
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 8px",
                  border: `1px solid ${UI_COLORS.border}`,
                  background: "transparent",
                  color: UI_COLORS.textSoft,
                  fontFamily: "var(--app-font-mono)",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <BrandIcon
                  iconKey={meta.iconKey}
                  mode="mono"
                  color={UI_COLORS.textMuted}
                  size={14}
                  label={meta.label}
                />
                <span
                  style={{
                    minWidth: 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {meta.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
