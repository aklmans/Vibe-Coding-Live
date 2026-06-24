import { useState, type CSSProperties } from "react";
import type { OverlayState } from "../../types";
import { useLocale } from "../../hooks/useLocale";
import { UI_BORDERS, UI_COLORS, cssAlpha } from "../../lib/design-tokens";
import {
  applyLiveBriefDraftToOverlayState,
  formatLiveBriefDraftJson,
  generateLiveBriefDraft,
  parseLiveBriefDraftJson,
  type LiveBriefDraft,
} from "../../lib/session-brief";
import {
  applySessionRecipeToOverlayState,
  formatSessionRecipeMarkdown,
  parseSessionRecipe,
  stateToSessionRecipe,
} from "../../lib/session-recipe";
import {
  WorkbenchButton,
  applyWorkbenchFocus,
  clearWorkbenchFocus,
  monoInputStyle,
} from "../shared/Field";

interface SessionRecipePanelProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
}

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  marginTop: 32,
  paddingTop: 24,
  borderTop: UI_BORDERS.hair,
};

const textareaStyle: CSSProperties = {
  ...monoInputStyle,
  width: "100%",
  minHeight: 142,
  resize: "vertical",
  border: UI_BORDERS.control,
  borderRadius: 4,
  background: UI_COLORS.inputInset,
  padding: "12px 14px",
  lineHeight: 1.55,
};

const compactTextareaStyle: CSSProperties = {
  ...textareaStyle,
  minHeight: 132,
};

const previewStyle: CSSProperties = {
  borderTop: UI_BORDERS.hair,
  paddingTop: 16,
  display: "grid",
  gap: 14,
};

const eyebrowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: UI_COLORS.text,
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const hintStyle: CSSProperties = {
  maxWidth: 760,
  fontSize: 11,
  color: UI_COLORS.textMuted,
  lineHeight: 1.5,
};

export default function SessionRecipePanel({
  state,
  onChange,
}: SessionRecipePanelProps) {
  const { t, locale } = useLocale();
  const [brief, setBrief] = useState("");
  const [draft, setDraft] = useState<LiveBriefDraft | null>(null);
  const [draftSource, setDraftSource] = useState("");
  const [importText, setImportText] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [message, setMessage] = useState("");

  const generateDraft = () => {
    const source = brief.trim();
    if (!source) {
      setDraft(null);
      setDraftSource("");
      setMessage(t("brief.empty"));
      return null;
    }

    const nextDraft = generateLiveBriefDraft(source, locale);
    setDraft(nextDraft);
    setDraftSource(source);
    setMessage(t("brief.generated"));
    return nextDraft;
  };

  const getCurrentDraft = () => {
    const source = brief.trim();
    if (!source) {
      setDraft(null);
      setDraftSource("");
      setMessage(t("brief.empty"));
      return null;
    }
    return draft && draftSource === source ? draft : generateDraft();
  };

  const applyDraft = () => {
    const nextDraft = getCurrentDraft();
    if (!nextDraft) return;
    onChange(applyLiveBriefDraftToOverlayState(state, nextDraft));
    setMessage(t("brief.applied"));
  };

  const copyDraftJson = () => {
    const nextDraft = getCurrentDraft();
    if (!nextDraft) return;
    const json = formatLiveBriefDraftJson(nextDraft);
    setImportText(json);
    setAdvancedOpen(true);
    setMessage(t("brief.exported"));

    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(json).catch(() => {
      setMessage(t("brief.copyFailed"));
    });
  };

  const exportCurrentMarkdown = () => {
    const markdown = formatSessionRecipeMarkdown(stateToSessionRecipe(state));
    setImportText(markdown);
    setAdvancedOpen(true);
    setMessage(t("brief.advancedExported"));

    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(markdown).catch(() => {
      setMessage(t("brief.copyFailed"));
    });
  };

  const importAdvanced = () => {
    if (!importText.trim()) {
      setMessage(t("brief.importEmpty"));
      return;
    }

    const jsonDraft = parseLiveBriefDraftJson(importText);
    if (jsonDraft) {
      setDraft(jsonDraft);
      setDraftSource(brief.trim());
      onChange(applyLiveBriefDraftToOverlayState(state, jsonDraft));
      setMessage(t("brief.imported"));
      return;
    }

    const recipe = parseSessionRecipe(importText, locale);
    onChange(applySessionRecipeToOverlayState(state, recipe, locale));
    setMessage(t("brief.imported"));
  };

  return (
    <section data-testid="session-recipe-panel" style={sectionStyle}>
      <div
        data-testid="brief-builder-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={eyebrowStyle}>
              <AccentMark />
              {t("brief.title")}
            </div>
            <div style={hintStyle}>{t("brief.hint")}</div>
          </div>

          {message && (
            <div
              style={{
                flexShrink: 0,
                maxWidth: 280,
                fontSize: 11,
                color: UI_COLORS.accentText,
                background: UI_COLORS.previewBadgeSurface,
                border: UI_BORDERS.control,
                borderRadius: 4,
                padding: "4px 8px",
                lineHeight: 1.4,
              }}
            >
              {message}
            </div>
          )}
        </div>

        <textarea
          data-testid="brief-input"
          value={brief}
          onChange={(event) => {
            const nextValue = event.target.value;
            setBrief(nextValue);
            if (draft && nextValue.trim() !== draftSource) {
              setDraft(null);
              setDraftSource("");
            }
          }}
          placeholder={t("brief.placeholder")}
          spellCheck={false}
          style={textareaStyle}
          onFocus={(e) => applyWorkbenchFocus(e.currentTarget)}
          onBlur={(e) => clearWorkbenchFocus(e.currentTarget)}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <RecipeButton
            data-testid="brief-import-toggle"
            onClick={() => setAdvancedOpen((open) => !open)}
          >
            {t("brief.importToggle")}
          </RecipeButton>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <RecipeButton data-testid="brief-generate" onClick={generateDraft}>
              {t("brief.generate")}
            </RecipeButton>
            <RecipeButton
              data-testid="brief-apply"
              onClick={applyDraft}
              accentColor={UI_COLORS.accent}
            >
              {t("brief.apply")}
            </RecipeButton>
          </div>
        </div>

        <BriefDraftPreview draft={draft} />

        {advancedOpen && (
          <div
            style={{
              borderTop: UI_BORDERS.hair,
              paddingTop: 16,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ ...eyebrowStyle, fontSize: 11 }}>
              <AccentMark muted />
              {t("brief.advancedTitle")}
            </div>
            <div style={hintStyle}>{t("brief.advancedHint")}</div>
            <textarea
              data-testid="brief-import-text"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder={t("brief.importPlaceholder")}
              spellCheck={false}
              style={compactTextareaStyle}
              onFocus={(e) => applyWorkbenchFocus(e.currentTarget)}
              onBlur={(e) => clearWorkbenchFocus(e.currentTarget)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <RecipeButton onClick={copyDraftJson}>
                {t("brief.exportJson")}
              </RecipeButton>
              <RecipeButton onClick={exportCurrentMarkdown}>
                {t("brief.exportMarkdown")}
              </RecipeButton>
              <RecipeButton
                data-testid="brief-import-markdown"
                onClick={importAdvanced}
                accentColor={UI_COLORS.accent}
              >
                {t("brief.importApply")}
              </RecipeButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function BriefDraftPreview({ draft }: { draft: LiveBriefDraft | null }) {
  const { t } = useLocale();

  return (
    <div data-testid="brief-draft-preview" style={previewStyle}>
      <div style={{ ...eyebrowStyle, fontSize: 11 }}>
        <AccentMark muted />
        {t("brief.previewTitle")}
      </div>

      {!draft ? (
        <div style={hintStyle}>{t("brief.previewEmpty")}</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <PreviewLine label={t("brief.previewCover")} value={draft.title} />
          <PreviewLine label={t("brief.previewTopic")} value={draft.topic} />
          <PreviewBlock
            label={t("brief.previewSections")}
            values={draft.sections.map(
              (section) => `${section.title}: ${section.bullets.join(" / ")}`,
            )}
          />
          <PreviewBlock label={t("brief.previewStack")} values={draft.stackItems} />
          <PreviewBlock label={t("brief.previewBadges")} values={draft.badgeKeys} />
        </div>
      )}
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "92px minmax(0, 1fr)",
        gap: 12,
        alignItems: "baseline",
      }}
    >
      <span style={previewLabelStyle}>{label}</span>
      <span style={previewValueStyle}>{value}</span>
    </div>
  );
}

function PreviewBlock({ label, values }: { label: string; values: readonly string[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "92px minmax(0, 1fr)",
        gap: 12,
      }}
    >
      <span style={previewLabelStyle}>{label}</span>
      <div style={{ display: "grid", gap: 5 }}>
        {values.length > 0 ? (
          values.map((value, index) => (
            <span key={`${value}-${index}`} style={previewValueStyle}>
              {value}
            </span>
          ))
        ) : (
          <span style={{ ...previewValueStyle, color: UI_COLORS.textSoft }}>—</span>
        )}
      </div>
    </div>
  );
}

const previewLabelStyle: CSSProperties = {
  color: UI_COLORS.textSoft,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const previewValueStyle: CSSProperties = {
  color: UI_COLORS.text,
  fontFamily: "var(--app-font-mono)",
  fontSize: 11,
  lineHeight: 1.45,
  overflowWrap: "anywhere",
};

function AccentMark({ muted = false }: { muted?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 3,
        height: 14,
        borderRadius: 2,
        background: muted ? cssAlpha(UI_COLORS.accent, 52) : UI_COLORS.accent,
      }}
    />
  );
}

function RecipeButton({
  children,
  onClick,
  accentColor = UI_COLORS.textSoft,
  "data-testid": testId,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accentColor?: string;
  "data-testid"?: string;
}) {
  return (
    <WorkbenchButton
      data-testid={testId}
      onClick={onClick}
      tone={accentColor === UI_COLORS.textSoft ? "neutral" : "accent"}
      accentColor={accentColor}
      style={{
        minWidth: 112,
        height: 32,
        padding: "0 12px",
      }}
    >
      {children}
    </WorkbenchButton>
  );
}
