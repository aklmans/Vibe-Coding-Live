import type { CSSProperties } from "react";
import { UI_COLORS, cssAlpha } from "../../lib/design-tokens";
import { useLocale } from "../../hooks/useLocale";
import type { TranslationKey } from "../../lib/i18n";

export type ConfigView = "prepare" | "form" | "json";

interface SessionConfigOutlineProps {
  view: ConfigView;
  onSelectView: (view: ConfigView) => void;
  /** Switch to the form view and scroll a form group into view. */
  onSelectFormAnchor: (anchorId: string) => void;
}

interface FormAnchor {
  id: string;
  testId: string;
  labelKey: TranslationKey;
}

const FORM_ANCHORS: FormAnchor[] = [
  { id: "config-form-sections", testId: "config-nav-sections", labelKey: "group.sections" },
  { id: "config-form-stack", testId: "config-nav-stack", labelKey: "group.stack" },
  { id: "config-form-live-session", testId: "config-nav-live-session", labelKey: "group.liveSession" },
  { id: "config-form-bottom-bar", testId: "config-nav-bottom-bar", labelKey: "group.bottomBarSegments" },
];

const groupLabel: CSSProperties = {
  fontFamily: "var(--app-font-mono)",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: UI_COLORS.textSubtle,
  padding: "0 12px",
};

/**
 * Left config outline — the spine of the Session Config Center. Top group
 * switches the workspace view (Prepare / Form / JSON); the Form group jumps to
 * a section within the form view. Editorial: hairline rail, mono labels, a
 * single accent mark on the active row.
 */
export default function SessionConfigOutline({
  view,
  onSelectView,
  onSelectFormAnchor,
}: SessionConfigOutlineProps) {
  const { t } = useLocale();

  return (
    <aside
      data-testid="config-outline"
      style={{
        width: 200,
        minWidth: 200,
        flexShrink: 0,
        borderRight: `1px solid ${UI_COLORS.border}`,
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflowY: "auto",
      }}
    >
      <div style={groupLabel}>{t("configOutline.workspace")}</div>
      <NavRow
        testId="config-nav-prepare"
        label={t("configView.prepare")}
        active={view === "prepare"}
        onClick={() => onSelectView("prepare")}
      />
      <NavRow
        testId="config-nav-form"
        label={t("configView.form")}
        active={view === "form"}
        onClick={() => onSelectView("form")}
      />
      <NavRow
        testId="config-nav-json"
        label={t("configView.json")}
        active={view === "json"}
        onClick={() => onSelectView("json")}
      />

      <div style={{ ...groupLabel, marginTop: 12 }}>{t("configOutline.formGroups")}</div>
      {FORM_ANCHORS.map((anchor) => (
        <NavRow
          key={anchor.id}
          testId={anchor.testId}
          label={t(anchor.labelKey)}
          active={false}
          sub
          onClick={() => onSelectFormAnchor(anchor.id)}
        />
      ))}
    </aside>
  );
}

function NavRow({
  label,
  active,
  sub = false,
  testId,
  onClick,
}: {
  label: string;
  active: boolean;
  sub?: boolean;
  testId: string;
  onClick: () => void;
}) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      style={{
        appearance: "none",
        textAlign: "left",
        width: "100%",
        background: active ? cssAlpha(UI_COLORS.accent, 8) : "transparent",
        border: "none",
        boxShadow: active ? `inset 2px 0 0 ${UI_COLORS.accent}` : "none",
        padding: sub ? "5px 12px 5px 22px" : "6px 12px",
        cursor: "pointer",
        fontFamily: "var(--app-font-mono)",
        fontSize: sub ? 11 : 11,
        fontWeight: active ? 700 : sub ? 500 : 600,
        letterSpacing: "0.04em",
        color: active ? UI_COLORS.text : sub ? UI_COLORS.textMuted : UI_COLORS.textSoft,
        transition: "color 0.12s, box-shadow 0.12s, background 0.12s",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = UI_COLORS.text;
      }}
      onMouseLeave={(e) => {
        if (!active)
          e.currentTarget.style.color = sub ? UI_COLORS.textMuted : UI_COLORS.textSoft;
      }}
    >
      {sub ? `· ${label}` : label}
    </button>
  );
}
