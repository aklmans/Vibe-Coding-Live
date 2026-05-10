import type { CSSProperties, ReactNode } from "react";

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
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "#C7D2FE",
          letterSpacing: "0.04em",
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
          background: "#0F1122",
          border: "1px solid #2a3060",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 13,
          color: "#F4F7FF",
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#8DA8FF")}
        onBlur={(e) => (e.target.style.borderColor = "#2a3060")}
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
          border: "1px solid rgba(255,255,255,0.12)",
          flexShrink: 0,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
        }}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <label style={{ fontSize: 12, color: "#C7D2FE" }} title={hint}>
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: 10, color: "#6B7CA8", lineHeight: 1.3 }}>
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
            border: "1px solid #2a3060",
            borderRadius: 4,
            padding: 1,
            background: "transparent",
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: 11, color: "#8DA8FF", fontFamily: "monospace" }}>
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
      <span style={{ fontSize: 13, color: "#C7D2FE" }}>{label}</span>
      <button
        data-testid={testId}
        onClick={() => onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          border: "none",
          cursor: "pointer",
          background: checked ? "#8DA8FF" : "#1F2235",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#F4F7FF",
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            transition: "left 0.2s",
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
        fontSize: 11,
        fontWeight: 600,
        color: "#8DA8FF",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "16px 0 8px",
        borderTop: "1px solid #1F2235",
        marginTop: 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
