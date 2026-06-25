import { useEffect, useState, type ReactNode } from "react";
import type { OverlayState } from "../../types";
import SourceOfTruthBar, { type SessionPersistence } from "./SourceOfTruthBar";
import SessionConfigOutline, { type ConfigView } from "./SessionConfigOutline";
import ConfigFormView from "./ConfigFormView";
import AgentPrepareView from "./AgentPrepareView";
import SessionConfigEditor from "./SessionConfigEditor";

interface LiveDataManagerProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
  dateKey: string;
  persistence: SessionPersistence;
  onReload: () => void;
  onStartSession: () => void;
  onEndSession: () => void;
}

/**
 * Session Config Center shell.
 *
 * Top: the source-of-truth bar (DB / local / OBS truth + session lifecycle).
 * Left: the config outline. Right: one workspace that switches between three
 * views of the *same* OverlayState —
 *   - Prepare : compose an AI handoff prompt → import the result.
 *   - Form    : the runtime editors, grouped core vs runtime.
 *   - JSON    : the live-session.config.json portable core (drift-safe editor).
 *
 * All three views stay mounted (visibility toggled) so the JSON view keeps its
 * synced projection across switches and the IA is statically inspectable.
 */
export default function LiveDataManager({
  state,
  onChange,
  dateKey,
  persistence,
  onReload,
  onStartSession,
  onEndSession,
}: LiveDataManagerProps) {
  const [view, setView] = useState<ConfigView>("form");
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);

  // Outline form items jump to a group: switch to the form view first, then
  // scroll once it is visible.
  useEffect(() => {
    if (view === "form" && pendingAnchor) {
      document
        .getElementById(pendingAnchor)
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
      setPendingAnchor(null);
    }
  }, [view, pendingAnchor]);

  const selectFormAnchor = (anchorId: string) => {
    setView("form");
    setPendingAnchor(anchorId);
  };

  return (
    <div
      data-testid="live-data-manager"
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <SourceOfTruthBar
        dateKey={dateKey}
        persistence={persistence}
        onReload={onReload}
        onStartSession={onStartSession}
        onEndSession={onEndSession}
      />

      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        <SessionConfigOutline
          view={view}
          onSelectView={setView}
          onSelectFormAnchor={selectFormAnchor}
        />

        <div
          data-testid="config-workspace"
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: "auto",
            padding: "22px 28px 56px",
            boxSizing: "border-box",
          }}
        >
          <ViewPane testId="config-view-prepare" active={view === "prepare"}>
            <AgentPrepareView state={state} onOpenJson={() => setView("json")} />
          </ViewPane>
          <ViewPane testId="config-view-form" active={view === "form"}>
            <ConfigFormView state={state} onChange={onChange} />
          </ViewPane>
          <ViewPane testId="config-view-json" active={view === "json"}>
            <SessionConfigEditor state={state} onChange={onChange} />
          </ViewPane>
        </div>
      </div>
    </div>
  );
}

function ViewPane({
  testId,
  active,
  children,
}: {
  testId: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div data-testid={testId} hidden={!active} style={{ display: active ? "block" : "none" }}>
      {children}
    </div>
  );
}
