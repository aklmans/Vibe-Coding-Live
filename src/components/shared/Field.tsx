import type { CSSProperties, ReactNode } from "react";
import { UI_COLORS } from "../../lib/design-tokens";

/* Shared low-level form atoms used across the inspector + drawer. Extracted
 * from the legacy EditorPanel.tsx so the visual style stays identical while
 * the layout shell is rebuilt. Keep these dumb — no app state imports. */

interface SectionInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testId?: string;
  placeholder?: string;
}

export function SectionInput({
  label,
  value,
  onChange,
  testId,
  placeholder,
}: SectionInputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontFamily: "var(--app-font-mono)",
          fontSize: 10,
          fontWeight: 500,
          color: UI_COLORS.textMuted,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <input
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: UI_COLORS.controlSurface,
          border: `1px solid ${UI_COLORS.border}`,
          borderRadius: 5,
          padding: "6px 10px",
          fontSize: 13,
          color: UI_COLORS.text,
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = UI_COLORS.accent)}
        onBlur={(e) => (e.target.style.borderColor = UI_COLORS.border)}
      />
    </div>
  );
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  testId?: string;
}

export function ColorInput({
  label,
  value,
  onChange,
  hint,
  testId,
}: ColorInputProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: "space-between",
      }}
    >
      <div
        title={hint}
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          background: value,
          border: `1px solid ${UI_COLORS.border}`,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <label style={{ fontSize: 12, color: UI_COLORS.textSoft }} title={hint}>
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: 10, color: UI_COLORS.textMuted, lineHeight: 1.3 }}>
            {hint}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          data-testid={testId}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 28,
            height: 24,
            border: `1px solid ${UI_COLORS.border}`,
            borderRadius: 4,
            padding: 1,
            background: "transparent",
            cursor: "pointer",
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: UI_COLORS.textMuted,
            fontFamily: "var(--app-font-mono)",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

interface ToggleButtonProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testId?: string;
}

export function ToggleButton({
  label,
  checked,
  onChange,
  testId,
}: ToggleButtonProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 0",
      }}
    >
      <span style={{ fontSize: 13, color: UI_COLORS.textSoft }}>{label}</span>
      <button
        data-testid={testId}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        style={{
          width: 38,
          height: 20,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: checked ? UI_COLORS.accent : UI_COLORS.border,
          position: "relative",
          transition: "background 0.16s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: checked ? UI_COLORS.white : UI_COLORS.textSoft,
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            transition: "left 0.16s, background 0.16s",
          }}
        />
      </button>
    </div>
  );
}

interface SectionHeadingProps {
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Lightweight section heading kept for legacy parts of the editor that still
 * use the "stacked-with-divider" visual. New inspector groups use
 * <InspectorGroup> instead.
 */
export function SectionHeading({ children, style }: SectionHeadingProps) {
  return (
    <div
      style={{
        fontFamily: "var(--app-font-mono)",
        fontSize: 10,
        fontWeight: 600,
        color: UI_COLORS.textMuted,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "16px 0 8px",
        borderTop: `1px solid ${UI_COLORS.border}`,
        marginTop: 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
