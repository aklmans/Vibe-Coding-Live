import type { CSSProperties, ReactNode } from "react";
import type { OverlayState } from "../../types";
import { UI_COLORS } from "../../lib/design-tokens";
import { patchSection } from "../../lib/state";
import { useLocale } from "../../hooks/useLocale";
import SidebarSectionEditor from "../SidebarSectionEditor";
import LiveSessionEditor from "../LiveSessionEditor";
import StackEditor from "../StackEditor";
import BottomBarSegmentEditor from "../BottomBarSegmentEditor";
import { WorkbenchLabel } from "../shared/Field";
import { LineSegmented, RuleNote } from "../inspector/EditorRow";

interface ConfigFormViewProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
}

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: UI_COLORS.textSoft,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

/**
 * The form view — the same editors as before, but reorganized so it is obvious
 * which fields are the portable core (in live-session.config.json) and which
 * are runtime / display controls that the JSON never carries. Editor testids
 * and business logic are unchanged; only the IA and headings move.
 */
export default function ConfigFormView({ state, onChange }: ConfigFormViewProps) {
  const { t } = useLocale();
  const activeSectionIndex = Math.min(
    Math.max(state.sidebar.activeSection, 0),
    Math.max(state.sidebar.sections.length - 1, 0),
  );
  const activeSection = state.sidebar.sections[activeSectionIndex];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 760 }}>
      {/* ── PORTABLE CORE ─────────────────────────────────────────────── */}
      <GroupHeader
        tone="core"
        title={t("configForm.coreTitle")}
        hint={t("configForm.coreHint")}
      />
      <RuleNote>{t("configForm.brandNote")}</RuleNote>

      <FieldGroup
        anchorId="config-form-sections"
        testId="live-data-sections"
        title={t("group.sections")}
        hint={t("configForm.sectionsNote")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <WorkbenchLabel style={labelStyle}>{t("label.activeSection")}</WorkbenchLabel>
          <LineSegmented
            testId="live-data-section-tabs"
            active={String(activeSectionIndex)}
            onSelect={(value) =>
              onChange(
                patchSection(state, "sidebar", { activeSection: Number(value) }),
              )
            }
            options={state.sidebar.sections.map((section, idx) => ({
              value: String(idx),
              label: section.title || `${t("label.section")} ${idx + 1}`,
              meta: `${(state.sidebar.sectionsDone?.[idx] ?? []).filter(Boolean).length}/${section.bullets.length}`,
              testId: `live-data-section-tab-${idx}`,
            }))}
          />
        </div>

        {activeSection && (
          <div
            data-testid={`live-data-section-panel-${activeSectionIndex}`}
            style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 14 }}
          >
            <SidebarSectionEditor
              state={state}
              onChange={onChange}
              index={activeSectionIndex}
              accentColor={UI_COLORS.accent}
            />
          </div>
        )}
      </FieldGroup>

      <FieldGroup
        anchorId="config-form-stack"
        testId="live-data-stack"
        title={t("group.stack")}
        hint={t("group.stack.hint")}
      >
        <StackEditor state={state} onChange={onChange} />
      </FieldGroup>

      {/* ── RUNTIME / DISPLAY ─────────────────────────────────────────── */}
      <div style={{ marginTop: 18 }}>
        <GroupHeader
          tone="runtime"
          title={t("configForm.runtimeTitle")}
          hint={t("configForm.runtimeHint")}
        />
      </div>

      <FieldGroup
        anchorId="config-form-live-session"
        testId="live-data-live-session"
        title={t("group.liveSession")}
        hint={t("group.liveSession.hint")}
      >
        <LiveSessionEditor state={state} onChange={onChange} />
      </FieldGroup>

      <FieldGroup
        anchorId="config-form-bottom-bar"
        testId="live-data-bottom-bar"
        title={t("group.bottomBarSegments")}
        hint={t("group.bottomBarSegments.hint")}
      >
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 14 }}
          >
            <span
              style={{
                fontFamily: "var(--app-font-mono)",
                fontSize: 10,
                fontWeight: 600,
                color: UI_COLORS.textMuted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {`${t("label.segment")} ${idx + 1}`}
            </span>
            <BottomBarSegmentEditor state={state} onChange={onChange} index={idx} />
          </div>
        ))}
      </FieldGroup>
    </div>
  );
}

/** A CORE / RUNTIME group banner — a colored left mark + caption so the
 *  config-vs-runtime boundary is impossible to miss. */
function GroupHeader({
  tone,
  title,
  hint,
}: {
  tone: "core" | "runtime";
  title: string;
  hint: string;
}) {
  const color = tone === "core" ? UI_COLORS.accent : UI_COLORS.textMuted;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingTop: 22,
        borderTop: `1px solid ${UI_COLORS.rule}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden style={{ width: 3, height: 14, borderRadius: 2, background: color }} />
        <span
          style={{
            fontFamily: "var(--app-font-mono)",
            fontSize: 11,
            fontWeight: 700,
            color: UI_COLORS.text,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ fontSize: 11, color: UI_COLORS.textMuted, lineHeight: 1.4, paddingLeft: 11 }}>
        {hint}
      </div>
    </div>
  );
}

function FieldGroup({
  anchorId,
  testId,
  title,
  hint,
  children,
}: {
  anchorId: string;
  testId: string;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section
      id={anchorId}
      data-testid={testId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 20,
        paddingTop: 16,
        borderTop: `1px solid ${UI_COLORS.border}`,
        scrollMarginTop: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            fontFamily: "var(--app-font-mono)",
            fontSize: 10,
            fontWeight: 700,
            color: UI_COLORS.textSoft,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: 11, color: UI_COLORS.textMuted, lineHeight: 1.4 }}>
          {hint}
        </span>
      </div>
      {children}
    </section>
  );
}
