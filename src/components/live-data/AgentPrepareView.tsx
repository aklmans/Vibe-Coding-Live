import { useMemo, useState, type CSSProperties } from "react";
import type { OverlayState } from "../../types";
import { useLocale } from "../../hooks/useLocale";
import { UI_BORDERS, UI_COLORS, cssAlpha } from "../../lib/design-tokens";
import { buildAgentPrompt } from "../../lib/agent-prompt";
import {
  WorkbenchButton,
  applyWorkbenchFocus,
  clearWorkbenchFocus,
  monoInputStyle,
} from "../shared/Field";

interface AgentPrepareViewProps {
  state: OverlayState;
  /** Switch the workspace to the JSON view to paste/import the agent's result. */
  onOpenJson: () => void;
}

const eyebrowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: UI_COLORS.text,
  fontFamily: "var(--app-font-mono)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const hintStyle: CSSProperties = {
  fontSize: 11,
  color: UI_COLORS.textMuted,
  lineHeight: 1.5,
  maxWidth: 640,
};

/**
 * AI Prepare — a handoff workspace, not a Recipe/Brief importer and not a live
 * LLM call. It composes a copy-paste prompt (v1 schema + the current config +
 * an optional plain-language brief) for the user's own AI tool, then points
 * them to paste the result into Config · JSON for review + Apply.
 */
export default function AgentPrepareView({
  state,
  onOpenJson,
}: AgentPrepareViewProps) {
  const { t } = useLocale();
  const [brief, setBrief] = useState("");
  const [message, setMessage] = useState("");

  const prompt = useMemo(() => buildAgentPrompt(state, brief), [state, brief]);

  const copyPrompt = () => {
    if (!navigator.clipboard) {
      setMessage(t("agentPrepare.copyFailed"));
      return;
    }
    void navigator.clipboard
      .writeText(prompt)
      .then(() => setMessage(t("agentPrepare.copied")))
      .catch(() => setMessage(t("agentPrepare.copyFailed")));
  };

  return (
    <div
      data-testid="agent-prepare"
      style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 720 }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={eyebrowStyle}>
          <Mark />
          {t("agentPrepare.title")}
        </div>
        <div style={hintStyle}>{t("agentPrepare.intro")}</div>
      </header>

      <Ruled label={t("agentPrepare.handoffTitle")}>
        <div style={hintStyle}>{t("agentPrepare.handoffBody")}</div>

        <label
          htmlFor="agent-brief-input"
          style={{
            fontFamily: "var(--app-font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: UI_COLORS.textMuted,
          }}
        >
          {t("agentPrepare.briefLabel")}
        </label>
        <textarea
          id="agent-brief-input"
          data-testid="agent-brief-input"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder={t("agentPrepare.briefPlaceholder")}
          spellCheck={false}
          style={{
            ...monoInputStyle,
            width: "100%",
            minHeight: 76,
            resize: "vertical",
            border: UI_BORDERS.control,
            borderRadius: 4,
            background: UI_COLORS.inputInset,
            padding: "10px 12px",
            lineHeight: 1.5,
          }}
          onFocus={(e) => applyWorkbenchFocus(e.currentTarget)}
          onBlur={(e) => clearWorkbenchFocus(e.currentTarget)}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <WorkbenchButton
            data-testid="agent-copy-prompt"
            onClick={copyPrompt}
            tone="accent"
            accentColor={UI_COLORS.accent}
            style={{ minWidth: 150, height: 32, padding: "0 12px" }}
          >
            {t("agentPrepare.copyPrompt")}
          </WorkbenchButton>
          {message && (
            <span style={{ fontSize: 11, color: UI_COLORS.accentText, lineHeight: 1.4 }}>
              {message}
            </span>
          )}
        </div>

        <div
          style={{
            fontFamily: "var(--app-font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: UI_COLORS.textSubtle,
          }}
        >
          {t("agentPrepare.promptTitle")}
        </div>
        <pre
          data-testid="agent-prompt-preview"
          style={{
            margin: 0,
            maxHeight: 200,
            overflow: "auto",
            fontFamily: "var(--app-font-mono)",
            fontSize: 11,
            lineHeight: 1.5,
            color: UI_COLORS.textSoft,
            background: UI_COLORS.inputInset,
            border: UI_BORDERS.control,
            borderRadius: 4,
            padding: "10px 12px",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {prompt}
        </pre>
      </Ruled>

      <Ruled label={t("agentPrepare.nextTitle")}>
        <div style={hintStyle}>{t("agentPrepare.nextBody")}</div>
        <WorkbenchButton
          data-testid="agent-open-json"
          onClick={onOpenJson}
          style={{ minWidth: 150, height: 32, padding: "0 12px" }}
        >
          {t("agentPrepare.openJson")}
        </WorkbenchButton>
      </Ruled>
    </div>
  );
}

function Ruled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 18,
        borderTop: `1px solid ${UI_COLORS.rule}`,
      }}
    >
      <div style={eyebrowStyle}>
        <Mark muted />
        {label}
      </div>
      {children}
    </section>
  );
}

function Mark({ muted = false }: { muted?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 3,
        height: 13,
        borderRadius: 2,
        background: muted ? cssAlpha(UI_COLORS.accent, 52) : UI_COLORS.accent,
      }}
    />
  );
}
