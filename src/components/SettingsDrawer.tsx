import { useCallback, useEffect, useRef } from "react";
import type { OverlayState } from "../types";
import { UI_COLORS } from "../lib/design-tokens";
import { produceState } from "../lib/state";
import { THEME_PRESETS, type ThemeMode } from "../lib/theme";
import { useLocale } from "../hooks/useLocale";
import type { Locale } from "../lib/i18n";
import { WorkbenchButton } from "./shared/Field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  state: OverlayState;
  onChange: (state: OverlayState) => void;
  onReset: () => void;
}

export default function SettingsDrawer({
  open,
  onClose,
  state,
  onChange,
  onReset,
}: SettingsDrawerProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const { t, locale, setLocale } = useLocale();

  const closeDrawer = useCallback(() => {
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      drawerRef.current?.contains(active)
    ) {
      active.blur();
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeDrawer]);

  const updateColor = (key: keyof typeof state.colors, value: string) => {
    onChange(
      produceState(state, (draft) => {
        draft.colors[key] = value;
      }),
    );
  };

  const applyTheme = (mode: ThemeMode) => {
    onChange(
      produceState(state, (draft) => {
        draft.theme = mode;
        draft.colors = { ...THEME_PRESETS[mode] };
      }),
    );
  };

  return (
    <>
      <div
        data-testid="settings-scrim"
        onClick={closeDrawer}
        style={{
          position: "fixed",
          inset: 0,
          background: UI_COLORS.overlayScrim,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.18s",
          zIndex: 60,
        }}
      />
      <aside
        ref={drawerRef}
        data-testid="settings-drawer"
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 360,
          height: "100vh",
          background: UI_COLORS.appSurface,
          borderLeft: `1px solid ${UI_COLORS.border}`,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.2s ease",
          zIndex: 70,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "15px 16px",
            borderBottom: `1px solid ${UI_COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--app-font-mono)",
                fontSize: 11,
                fontWeight: 600,
                color: UI_COLORS.text,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {t("settings.title")}
            </div>
            <div
              style={{
                fontSize: 11,
                color: UI_COLORS.textMuted,
                marginTop: 2,
              }}
            >
              {t("settings.subtitle")}
            </div>
          </div>
          <button
            data-testid="settings-close"
            onClick={closeDrawer}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${UI_COLORS.border}`,
              background: "transparent",
              color: UI_COLORS.textMuted,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 15,
              transition: "color 0.12s, border-color 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = UI_COLORS.textSoft;
              (e.currentTarget as HTMLElement).style.borderColor = UI_COLORS.rule;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = UI_COLORS.textMuted;
              (e.currentTarget as HTMLElement).style.borderColor = UI_COLORS.border;
            }}
            aria-label={t("settings.closeSettings")}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <Section first title={t("language.zh") === "中文" ? "语言 / Language" : "Language / 语言"}>
            <SettingsSelector
              options={[
                { value: "zh", label: "中文", testId: "locale-zh" },
                { value: "en", label: "English", testId: "locale-en" },
              ]}
              active={locale}
              onSelect={(loc) => setLocale(loc as Locale)}
            />
          </Section>

          <Section title={t("settings.theme")} hint={t("settings.themeHint")}>
            <SettingsSelector
              options={[
                { value: "light", label: t("theme.light"), testId: "theme-light" },
                { value: "dark", label: t("theme.dark"), testId: "theme-dark" },
              ]}
              active={state.theme}
              onSelect={(mode) => applyTheme(mode as ThemeMode)}
            />
          </Section>

          <Section title={t("settings.colorsSurface")}>
            <ColorRow
              label={t("color.bgDark")}
              hint={t("color.bgDarkHint")}
              value={state.colors.bgDark}
              onChange={(v) => updateColor("bgDark", v)}
              testId="color-bg-dark"
            />
            <ColorRow
              label={t("color.bgPanel")}
              hint={t("color.bgPanelHint")}
              value={state.colors.bgPanel}
              onChange={(v) => updateColor("bgPanel", v)}
              testId="color-bg-panel"
            />
            <ColorRow
              label={t("color.border")}
              hint={t("color.borderHint")}
              value={state.colors.borderColor}
              onChange={(v) => updateColor("borderColor", v)}
              testId="color-border"
            />
          </Section>

          <Section title={t("settings.colorsText")}>
            <ColorRow
              label={t("color.text")}
              hint={t("color.textHint")}
              value={state.colors.textColor}
              onChange={(v) => updateColor("textColor", v)}
              testId="color-text"
            />
            <ColorRow
              label={t("color.mutedText")}
              hint={t("color.mutedTextHint")}
              value={state.colors.mutedText}
              onChange={(v) => updateColor("mutedText", v)}
              testId="color-muted"
            />
            <ColorRow
              label={t("color.subtleText")}
              hint={t("color.subtleTextHint")}
              value={state.colors.subtleText}
              onChange={(v) => updateColor("subtleText", v)}
              testId="color-subtle"
            />
          </Section>

          <Section title={t("settings.colorsAccent")}>
            <ColorRow
              label={t("color.cyan")}
              hint={t("color.cyanHint")}
              value={state.colors.cyanAccent}
              onChange={(v) => updateColor("cyanAccent", v)}
              testId="color-cyan"
            />
            <ColorRow
              label={t("color.pink")}
              hint={t("color.pinkHint")}
              value={state.colors.pinkAccent}
              onChange={(v) => updateColor("pinkAccent", v)}
              testId="color-pink"
            />
            <ColorRow
              label={t("color.warm")}
              hint={t("color.warmHint")}
              value={state.colors.warmAccent}
              onChange={(v) => updateColor("warmAccent", v)}
              testId="color-warm"
            />
          </Section>

          <Section title={t("group.dangerZone")}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <WorkbenchButton
                  testId="btn-reset"
                  style={{
                    width: "100%",
                    padding: "0 12px",
                  }}
                  tone="danger"
                >
                  {t("reset.button")}
                </WorkbenchButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("reset.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("reset.description")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="btn-reset-cancel">
                    {t("btn.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-testid="btn-reset-confirm"
                    onClick={() => {
                      onReset();
                      closeDrawer();
                    }}
                  >
                    {t("reset.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Section>
        </div>
      </aside>
    </>
  );
}

interface SettingsSelectorOption<T extends string> {
  value: T;
  label: string;
  testId: string;
}

function SettingsSelector<T extends string>({
  options,
  active,
  onSelect,
}: {
  options: SettingsSelectorOption<T>[];
  active: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        borderTop: `1px solid ${UI_COLORS.border}`,
        borderBottom: `1px solid ${UI_COLORS.border}`,
      }}
    >
      {options.map((option, index) => {
        const isActive = option.value === active;
        return (
          <button
            key={option.value}
            data-testid={option.testId}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(option.value)}
            style={{
              height: 38,
              border: "none",
              borderRight:
                index === options.length - 1
                  ? "none"
                  : `1px solid ${UI_COLORS.border}`,
              background: "transparent",
              color: isActive ? UI_COLORS.text : UI_COLORS.textMuted,
              cursor: "pointer",
              fontFamily: "var(--app-font-mono)",
              fontSize: 11,
              fontWeight: isActive ? 650 : 600,
              letterSpacing: "0.08em",
              boxShadow: isActive ? `inset 0 -2px 0 ${UI_COLORS.accent}` : "none",
              transition: "color 0.12s, box-shadow 0.12s",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  testId?: string;
}

function ColorRow({ label, value, onChange, hint, testId }: ColorRowProps) {
  return (
    <label
      title={hint}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto auto",
        alignItems: "center",
        gap: 10,
        padding: "10px 0",
        borderTop: `1px solid ${UI_COLORS.border}`,
      }}
    >
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            color: UI_COLORS.textSoft,
            fontSize: 12,
            lineHeight: 1.25,
          }}
        >
          {label}
        </span>
        {hint && (
          <span
            style={{
              display: "block",
              color: UI_COLORS.textMuted,
              fontSize: 10,
              lineHeight: 1.35,
              marginTop: 2,
            }}
          >
            {hint}
          </span>
        )}
      </span>
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          borderRadius: 2,
          background: value,
          border: `1px solid ${UI_COLORS.controlBorder}`,
        }}
      />
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          data-testid={testId}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 24,
            height: 22,
            border: `1px solid ${UI_COLORS.controlBorder}`,
            borderRadius: 2,
            padding: 1,
            background: "transparent",
            cursor: "pointer",
          }}
        />
        <span
          style={{
            minWidth: 66,
            color: UI_COLORS.textMuted,
            fontFamily: "var(--app-font-mono)",
            fontSize: 10,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {value}
        </span>
      </span>
    </label>
  );
}

interface SectionProps {
  title: string;
  hint?: string;
  /** The first section sits right under the drawer header rule — skip its own
   *  top rule so the two don't stack into a double line. */
  first?: boolean;
  children: React.ReactNode;
}

function Section({ title, hint, first, children }: SectionProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: first ? 0 : 14,
        borderTop: first ? "none" : `1px solid ${UI_COLORS.border}`,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--app-font-mono)",
            fontSize: 10,
            fontWeight: 600,
            color: UI_COLORS.textMuted,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        {hint && (
          <div style={{ fontSize: 10, color: UI_COLORS.textSubtle, marginTop: 3 }}>
            {hint}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {children}
      </div>
    </div>
  );
}
