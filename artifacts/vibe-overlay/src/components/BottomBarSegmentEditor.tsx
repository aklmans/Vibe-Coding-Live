import type { OverlayState } from "../types";
import {
  BOTTOM_BAR_KIND_OPTIONS,
  defaultSlotForKind,
  type BottomBarKind,
  type BottomBarSlot,
} from "../lib/bottomBar";

interface BottomBarSegmentEditorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
  index: number;
}

/**
 * Single-segment editor: kind picker first, then kind-specific fields.
 * Wired up so changing kind resets the slot to the default for that kind.
 */
export default function BottomBarSegmentEditor({
  state,
  onChange,
  index,
}: BottomBarSegmentEditorProps) {
  const slot = state.bottomBar.segments[index];
  if (!slot) return null;

  const writeSlot = (next: BottomBarSlot) => {
    const segments = state.bottomBar.segments.map((s, i) =>
      i === index ? next : s,
    );
    onChange({ ...state, bottomBar: { ...state.bottomBar, segments } });
  };

  const setKind = (kind: BottomBarKind) => {
    if (kind === slot.kind) return;
    writeSlot(defaultSlotForKind(kind));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Kind picker */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 4,
          background: "#0F1122",
          padding: 3,
          borderRadius: 6,
          border: "1px solid #1F2235",
        }}
      >
        {BOTTOM_BAR_KIND_OPTIONS.map((opt) => {
          const active = slot.kind === opt.value;
          return (
            <button
              key={opt.value}
              data-testid={`bottom-seg${index + 1}-kind-${opt.value}`}
              onClick={() => setKind(opt.value)}
              style={{
                padding: "5px 0",
                background: active ? "#1F2235" : "transparent",
                border: "none",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 500,
                color: active ? "#F4F7FF" : "#6B7CA8",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Kind-specific fields */}
      {slot.kind === "live" && (
        <div
          style={{
            fontSize: 11,
            color: "#6B7CA8",
            lineHeight: 1.5,
            padding: "6px 10px",
            background: "#0F1122",
            border: "1px solid #1F2235",
            borderRadius: 6,
          }}
        >
          直播开始时间在 Live Session 区设置，时长会按秒自动刷新。
        </div>
      )}

      {slot.kind === "progress" && (
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#0F1122",
            padding: 3,
            borderRadius: 6,
            border: "1px solid #1F2235",
          }}
        >
          {state.sidebar.sections.map((section, sIdx) => {
            const active = slot.sectionIndex === sIdx;
            return (
              <button
                key={sIdx}
                data-testid={`bottom-seg${index + 1}-progress-${sIdx}`}
                onClick={() => writeSlot({ ...slot, sectionIndex: sIdx })}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  background: active ? "#1F2235" : "transparent",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: active ? "#F4F7FF" : "#6B7CA8",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  transition: "all 0.15s",
                }}
              >
                {section.title || `Section ${sIdx + 1}`}
              </button>
            );
          })}
        </div>
      )}

      {slot.kind === "stack" && (
        <div
          style={{
            fontSize: 11,
            color: "#6B7CA8",
            lineHeight: 1.5,
            padding: "6px 10px",
            background: "#0F1122",
            border: "1px solid #1F2235",
            borderRadius: 6,
          }}
        >
          内容在 Live Session › Stack 列表中编辑。
        </div>
      )}

      {slot.kind === "topic" && (
        <div
          style={{
            fontSize: 11,
            color: "#6B7CA8",
            lineHeight: 1.5,
            padding: "6px 10px",
            background: "#0F1122",
            border: "1px solid #1F2235",
            borderRadius: 6,
          }}
        >
          自动镜像 Cover/Poster 中的 TODAY'S BUILD。
        </div>
      )}

      {slot.kind === "text" && (
        <>
          <PlainInput
            label="Title"
            value={slot.title}
            onChange={(v) => writeSlot({ ...slot, title: v })}
            testId={`bottom-seg${index + 1}-title`}
          />
          <PlainInput
            label="Text"
            value={slot.text}
            onChange={(v) => writeSlot({ ...slot, text: v })}
            testId={`bottom-seg${index + 1}-text`}
          />
        </>
      )}
    </div>
  );
}

interface PlainInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testId?: string;
}

function PlainInput({ label, value, onChange, testId }: PlainInputProps) {
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
