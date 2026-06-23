import { useState } from "react";
import type { OverlayState } from "../types";
import { UI_COLORS } from "../lib/design-tokens";
import { patchSection } from "../lib/state";
import { useLocale } from "../hooks/useLocale";
import { TextInput } from "./shared/Field";

interface StackEditorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
}

/**
 * Inline editor for the tool stack (Claude / Cursor / etc) shown in the
 * bottom-bar Stack slot. Items are an ordered string list; each row supports
 * inline edit + delete, and a single input at the bottom appends.
 */
export default function StackEditor({ state, onChange }: StackEditorProps) {
  const { t } = useLocale();
  const [draft, setDraft] = useState("");

  const writeItems = (items: string[]) => {
    onChange(patchSection(state, "stack", { items }));
  };

  const updateItem = (idx: number, value: string) => {
    writeItems(state.stack.items.map((s, i) => (i === idx ? value : s)));
  };

  const removeItem = (idx: number) => {
    writeItems(state.stack.items.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    writeItems([...state.stack.items, trimmed]);
    setDraft("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {state.stack.items.map((item, idx) => (
        <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <TextInput
            testId={`stack-item-${idx}`}
            value={item}
            onChange={(value) => updateItem(idx, value)}
            style={{ flex: 1 }}
          />
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
              (e.currentTarget as HTMLElement).style.color = UI_COLORS.danger;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = UI_COLORS.textSubtle;
            }}
          >
            ×
          </button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
        <TextInput
          testId="stack-add-input"
          value={draft}
          onChange={setDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={t("stackEditor.placeholder")}
          style={{ flex: 1, borderStyle: "dashed" }}
        />
        <button
          data-testid="stack-add"
          onClick={addItem}
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
    </div>
  );
}
