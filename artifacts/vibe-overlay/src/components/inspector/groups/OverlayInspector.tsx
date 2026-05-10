import type { OverlayState } from "../../../types";
import InspectorGroup from "../InspectorGroup";
import { SectionInput, ToggleButton } from "../../shared/Field";
import SidebarSectionEditor from "../../SidebarSectionEditor";
import LiveSessionEditor from "../../LiveSessionEditor";
import StackEditor from "../../StackEditor";
import BottomBarSegmentEditor from "../../BottomBarSegmentEditor";

interface OverlayInspectorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
}

const SECTION_ACCENTS = ["#7DD3FC", "#FF6FAE", "#FFB86B"] as const;

export default function OverlayInspector({
  state,
  onChange,
}: OverlayInspectorProps) {
  return (
    <>
      <InspectorGroup
        title="Visibility"
        hint="Toggle major surfaces"
        testId="group-overlay-visibility"
      >
        <ToggleButton
          label="Main Screen"
          checked={state.mainScreen.visible}
          onChange={(v) =>
            onChange({ ...state, mainScreen: { ...state.mainScreen, visible: v } })
          }
          testId="toggle-main-screen"
        />
        <ToggleButton
          label="Camera Frame"
          checked={state.mainScreen.cameraVisible}
          onChange={(v) =>
            onChange({
              ...state,
              mainScreen: { ...state.mainScreen, cameraVisible: v },
            })
          }
          testId="toggle-camera"
        />
        <ToggleButton
          label="Right Sidebar"
          checked={state.sidebar.visible}
          onChange={(v) =>
            onChange({ ...state, sidebar: { ...state.sidebar, visible: v } })
          }
          testId="toggle-sidebar"
        />
        <ToggleButton
          label="Sidebar Social Info"
          checked={state.sidebar.socialVisible}
          onChange={(v) =>
            onChange({
              ...state,
              sidebar: { ...state.sidebar, socialVisible: v },
            })
          }
          testId="toggle-sidebar-social"
        />
        <ToggleButton
          label="Bottom Bar"
          checked={state.bottomBar.visible}
          onChange={(v) =>
            onChange({ ...state, bottomBar: { ...state.bottomBar, visible: v } })
          }
          testId="toggle-bottom-bar"
        />
      </InspectorGroup>

      <InspectorGroup
        title="Sections"
        hint="Three sidebar tracks"
        testId="group-overlay-sections"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#C7D2FE",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Active Section
          </span>
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#0F1122",
              padding: 3,
              borderRadius: 8,
              border: "1px solid #1F2235",
            }}
          >
            {state.sidebar.sections.map((s, idx) => (
              <button
                key={idx}
                data-testid={`active-section-${idx}`}
                onClick={() =>
                  onChange({
                    ...state,
                    sidebar: { ...state.sidebar, activeSection: idx },
                  })
                }
                style={{
                  flex: 1,
                  padding: "5px 0",
                  background:
                    state.sidebar.activeSection === idx
                      ? "#1F2235"
                      : "transparent",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#F4F7FF",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.04em",
                  transition: "all 0.15s",
                }}
              >
                {s.title || `Section ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {state.sidebar.sections.map((_, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: SECTION_ACCENTS[idx],
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Section {idx + 1}
            </span>
            <SidebarSectionEditor
              state={state}
              onChange={onChange}
              index={idx}
              accentColor={SECTION_ACCENTS[idx]}
            />
          </div>
        ))}
      </InspectorGroup>

      <InspectorGroup
        title="Live Bar"
        hint="On-Air timer · stack · 3 segments"
        testId="group-overlay-live-bar"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#C7D2FE",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Live Session
          </span>
          <LiveSessionEditor state={state} onChange={onChange} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#C7D2FE",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Stack
          </span>
          <StackEditor state={state} onChange={onChange} />
        </div>

        {[0, 1, 2].map((idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#C7D2FE",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Segment {idx + 1}
            </span>
            <BottomBarSegmentEditor
              state={state}
              onChange={onChange}
              index={idx}
            />
          </div>
        ))}
      </InspectorGroup>
    </>
  );
}
