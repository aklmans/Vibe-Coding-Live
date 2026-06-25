import { useState, type CSSProperties, type ReactNode } from "react";
import type { OverlayState } from "../../types";
import { useLocale } from "../../hooks/useLocale";
import { UI_BORDERS, UI_COLORS, cssAlpha } from "../../lib/design-tokens";
import {
  configToOverlayState,
  formatLiveStudioConfigJson,
  overlayStateToConfig,
  parseLiveStudioConfigJson,
  validateLiveStudioConfig,
  type LiveStudioConfig,
  type LiveStudioConfigValidation,
} from "../../lib/live-studio-config";
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
  minHeight: 286,
  resize: "vertical",
  border: UI_BORDERS.control,
  borderRadius: 4,
  background: UI_COLORS.inputInset,
  padding: "12px 14px",
  lineHeight: 1.55,
};

const resultStyle: CSSProperties = {
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

type ConfigReadResult = {
  validation: LiveStudioConfigValidation;
  config: LiveStudioConfig | null;
};

export default function SessionRecipePanel({
  state,
  onChange,
}: SessionRecipePanelProps) {
  const { t } = useLocale();
  const [configText, setConfigText] = useState(() =>
    formatLiveStudioConfigJson(overlayStateToConfig(state)),
  );
  const [validation, setValidation] =
    useState<LiveStudioConfigValidation | null>(null);
  const [previewConfig, setPreviewConfig] =
    useState<LiveStudioConfig | null>(() => overlayStateToConfig(state));
  const [message, setMessage] = useState("");

  const readConfigText = (): ConfigReadResult => {
    const source = configText.trim();
    if (!source) {
      return {
        validation: { valid: false, issues: [t("config.empty")] },
        config: null,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(source) as unknown;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      return {
        validation: {
          valid: false,
          issues: [`${t("config.invalidJson")}: ${detail}`],
        },
        config: null,
      };
    }

    const nextValidation = validateLiveStudioConfig(parsed);
    if (!nextValidation.valid) {
      return { validation: nextValidation, config: null };
    }

    return {
      validation: nextValidation,
      config: parseLiveStudioConfigJson(source),
    };
  };

  const validateConfigText = () => {
    const result = readConfigText();
    setValidation(result.validation);
    setPreviewConfig(result.config);
    setMessage(result.validation.valid ? t("config.valid") : t("config.invalid"));
  };

  const applyConfigText = () => {
    const result = readConfigText();
    setValidation(result.validation);
    setPreviewConfig(result.config);

    if (!result.validation.valid || !result.config) {
      setMessage(t("config.invalid"));
      return;
    }

    onChange(configToOverlayState(state, result.config));
    setConfigText(formatLiveStudioConfigJson(result.config));
    setMessage(t("config.applied"));
  };

  const exportCurrentConfig = () => {
    const currentConfig = overlayStateToConfig(state);
    const json = formatLiveStudioConfigJson(currentConfig);
    setConfigText(json);
    setPreviewConfig(currentConfig);
    setValidation({ valid: true, issues: [] });
    setMessage(t("config.exported"));

    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(json).catch(() => {
      setMessage(t("config.copyFailed"));
    });
  };

  return (
    <section data-testid="config-studio-panel" style={sectionStyle}>
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
            {t("config.title")}
          </div>
          <div style={hintStyle}>{t("config.hint")}</div>
        </div>

        {message && (
          <div
            style={{
              flexShrink: 0,
              maxWidth: 300,
              fontSize: 11,
              color: validation?.valid === false ? UI_COLORS.danger : UI_COLORS.accentText,
              background:
                validation?.valid === false
                  ? UI_COLORS.dangerSurface
                  : UI_COLORS.previewBadgeSurface,
              border:
                validation?.valid === false
                  ? UI_BORDERS.danger
                  : UI_BORDERS.control,
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
        data-testid="config-input"
        value={configText}
        onChange={(event) => {
          setConfigText(event.target.value);
          setValidation(null);
        }}
        placeholder={t("config.placeholder")}
        spellCheck={false}
        style={textareaStyle}
        onFocus={(event) => applyWorkbenchFocus(event.currentTarget)}
        onBlur={(event) => clearWorkbenchFocus(event.currentTarget)}
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
        <ConfigButton data-testid="config-export" onClick={exportCurrentConfig}>
          {t("config.exportCurrent")}
        </ConfigButton>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <ConfigButton data-testid="config-validate" onClick={validateConfigText}>
            {t("config.validate")}
          </ConfigButton>
          <ConfigButton
            data-testid="config-apply"
            onClick={applyConfigText}
            accentColor={UI_COLORS.accent}
          >
            {t("config.apply")}
          </ConfigButton>
        </div>
      </div>

      <ConfigResultPanel validation={validation} config={previewConfig} />
    </section>
  );
}

function ConfigResultPanel({
  validation,
  config,
}: {
  validation: LiveStudioConfigValidation | null;
  config: LiveStudioConfig | null;
}) {
  const { t } = useLocale();

  return (
    <div data-testid="config-result" style={resultStyle}>
      <div style={{ ...eyebrowStyle, fontSize: 11 }}>
        <AccentMark muted />
        {t("config.previewTitle")}
      </div>

      {validation && (
        <ValidationStatus validation={validation} />
      )}

      {!config ? (
        <div style={hintStyle}>{t("config.previewEmpty")}</div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <PreviewLine label={t("config.summaryTitle")} value={config.title} />
            <PreviewLine label={t("config.summarySubtitle")} value={config.subtitle} />
            <PreviewLine
              label={t("config.summarySections")}
              value={String(config.sections.length)}
            />
            <PreviewLine
              label={t("config.summaryStack")}
              value={String(config.stack.length)}
            />
            <PreviewLine
              label={t("config.summaryBadges")}
              value={String(config.badges.length)}
            />
            <PreviewLine
              label={t("config.summarySocials")}
              value={String(config.socials.length)}
            />
          </div>

          <PreviewBlock
            label={t("config.previewSurfaces")}
            values={[
              t("config.surface.cover"),
              t("config.surface.badges"),
              t("config.surface.stack"),
              t("config.surface.socials"),
              t("config.surface.sections"),
              t("config.surface.bottomBar"),
            ]}
          />
        </div>
      )}
    </div>
  );
}

function ValidationStatus({
  validation,
}: {
  validation: LiveStudioConfigValidation;
}) {
  const { t } = useLocale();
  const color = validation.valid ? UI_COLORS.success : UI_COLORS.danger;

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: "10px 0 0",
        borderTop: UI_BORDERS.hair,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color,
          fontFamily: "var(--app-font-mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: color,
          }}
        />
        {validation.valid ? t("config.valid") : t("config.invalid")}
      </div>

      {!validation.valid && validation.issues.length > 0 && (
        <ul
          style={{
            margin: 0,
            padding: "0 0 0 18px",
            color: UI_COLORS.danger,
            fontSize: 11,
            lineHeight: 1.45,
          }}
        >
          {validation.issues.map((issue, index) => (
            <li key={`${issue}-${index}`}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px minmax(0, 1fr)",
        gap: 12,
        alignItems: "baseline",
      }}
    >
      <span style={previewLabelStyle}>{label}</span>
      <span style={previewValueStyle}>{value || "—"}</span>
    </div>
  );
}

function PreviewBlock({
  label,
  values,
}: {
  label: string;
  values: readonly string[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px minmax(0, 1fr)",
        gap: 12,
      }}
    >
      <span style={previewLabelStyle}>{label}</span>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            style={{
              ...previewValueStyle,
              border: UI_BORDERS.control,
              borderRadius: 3,
              padding: "3px 7px",
              background: UI_COLORS.inputInset,
            }}
          >
            {value}
          </span>
        ))}
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

function ConfigButton({
  children,
  onClick,
  accentColor = UI_COLORS.textSoft,
  "data-testid": testId,
}: {
  children: ReactNode;
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
        minWidth: 118,
        height: 32,
        padding: "0 12px",
      }}
    >
      {children}
    </WorkbenchButton>
  );
}
