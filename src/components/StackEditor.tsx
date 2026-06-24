import { useMemo, useState } from "react";
import type { OverlayState } from "../types";
import { UI_COLORS } from "../lib/design-tokens";
import { patchSection } from "../lib/state";
import {
  BRAND_ICON_PRESETS,
  BRAND_ICON_REGISTRY,
  brandIconLabel,
  searchBrandIcons,
  type BrandIconKey,
  type BrandIconMode,
  type BrandIconPreset,
} from "../lib/brand-icons";
import {
  createStackItem,
  type StackItem,
} from "../lib/stack";
import { useLocale } from "../hooks/useLocale";
import { TextInput } from "./shared/Field";
import { BrandIcon } from "./shared/BrandIcon";
import { EditorRow, FieldLine, LineSegmented } from "./inspector/EditorRow";
import IconSearchPicker, { type IconSearchPickerOption, type IconSearchPickerPreset } from "./shared/IconSearchPicker";

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

  const stackPresets = BRAND_ICON_PRESETS.filter((preset) =>
    ["ai-agents", "frontend", "streaming"].includes(preset.id),
  );

  const usedIconKeys = useMemo(
    () => new Set(state.stack.items.map((item) => item.iconKey).filter(Boolean)),
    [state.stack.items],
  );

  const addIconPreset = (preset: BrandIconPreset) => {
    const additions = preset.keys
      .filter((key) => !usedIconKeys.has(key))
      .map((key) => createStackItem(brandIconLabel(key), key));
    if (additions.length === 0) return;
    writeItems([...state.stack.items, ...additions]);
    setDraft("");
  };

  const addOptions = useMemo(() => {
    const options: IconSearchPickerOption[] = searchBrandIcons(draft)
      .slice(0, 6)
      .map((meta) => ({
        id: meta.iconKey,
        label: meta.label,
        metaLabel: meta.category,
        testId: `stack-add-option-${meta.iconKey}`,
        icon: (
          <BrandIcon
            iconKey={meta.iconKey}
            mode="mono"
            color={UI_COLORS.textMuted}
            size={14}
            label={meta.label}
          />
        ),
      }));

    const trimmed = draft.trim();
    if (trimmed) {
      options.push({
        id: "custom",
        label: trimmed,
        metaLabel: t("label.custom"),
        testId: "stack-add",
      });
    }
    return options;
  }, [draft, t]);

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

      <IconSearchPicker
        testIdPrefix="stack"
        query={draft}
        onQueryChange={setDraft}
        placeholder={t("stackEditor.placeholder")}
        presets={stackPresets.map((preset): IconSearchPickerPreset => ({
          id: preset.id,
          label: preset.label,
          disabled: preset.keys.every((key) => usedIconKeys.has(key)),
        }))}
        options={addOptions}
        onSelectPreset={(preset) => {
          const found = stackPresets.find((item) => item.id === preset.id);
          if (found) addIconPreset(found);
        }}
        onSelectOption={(option) => {
          if (option.id === "custom") addTextItem();
          else addIconItem(option.id as BrandIconKey);
        }}
      />
    </div>
  );
}
