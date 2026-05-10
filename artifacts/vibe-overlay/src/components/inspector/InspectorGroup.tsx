import { useState, type ReactNode } from "react";

interface InspectorGroupProps {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  testId?: string;
  children: ReactNode;
}

/**
 * Accordion-style folding group for the right inspector. Self-contained so it
 * doesn't depend on Radix Accordion (we want individual open/close state
 * without coupling to siblings). All groups default to open — the inspector
 * is meant to feel like a settings panel, not a navigation tree.
 */
export default function InspectorGroup({
  title,
  hint,
  defaultOpen = true,
  testId,
  children,
}: InspectorGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      data-testid={testId}
      style={{
        borderBottom: "1px solid #1F2235",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "#F4F7FF",
        }}
        data-testid={testId ? `${testId}-toggle` : undefined}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8DA8FF",
            }}
          >
            {title}
          </span>
          {hint && (
            <span
              style={{
                fontSize: 10,
                color: "#6B7CA8",
                fontWeight: 400,
                letterSpacing: "0.02em",
                textTransform: "none",
              }}
            >
              {hint}
            </span>
          )}
        </div>
        <span
          aria-hidden
          style={{
            fontSize: 14,
            color: "#6B7CA8",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.18s",
          }}
        >
          ⌄
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
