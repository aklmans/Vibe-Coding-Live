import type { OverlayState } from "../../types";
import ExportMenu from "./ExportMenu";

interface TopBarProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
  exporting: string | null;
  onExportOverlay: () => void;
  onExportSidebar: () => void;
  onExportBottomBar: () => void;
  onExportCover: () => void;
  onExportPoster: () => void;
  onExportWallpaper: () => void;
  onOpenSettings: () => void;
}

const TABS: OverlayState["activeTab"][] = [
  "overlay",
  "cover",
  "poster",
  "wallpaper",
];

const TAB_LABELS: Record<OverlayState["activeTab"], string> = {
  overlay: "Overlay",
  cover: "Cover",
  poster: "Poster",
  wallpaper: "Wallpaper",
};

/**
 * Top application bar — replaces the legacy 280px left rail's header. Holds
 * brand mark, tab segmented control, primary export action + dropdown, and
 * the settings drawer trigger. Heights and spacing match the Inspector header
 * for visual continuity.
 */
export default function TopBar({
  state,
  onChange,
  exporting,
  onExportOverlay,
  onExportSidebar,
  onExportBottomBar,
  onExportCover,
  onExportPoster,
  onExportWallpaper,
  onOpenSettings,
}: TopBarProps) {
  return (
    <header
      data-testid="topbar"
      style={{
        height: 56,
        flexShrink: 0,
        background: "#0D0E1C",
        borderBottom: "1px solid #1F2235",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 16px",
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background:
              "linear-gradient(135deg, #7C9FFF 0%, #C084FC 50%, #FF6FAE 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0D0E1C",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "-0.02em",
          }}
        >
          V
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#F4F7FF",
            letterSpacing: "0.01em",
          }}
        >
          Vibe Overlay
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 2,
          background: "#0F1122",
          padding: 3,
          borderRadius: 8,
          border: "1px solid #1F2235",
        }}
      >
        {TABS.map((tab) => {
          const active = state.activeTab === tab;
          return (
            <button
              key={tab}
              data-testid={`tab-${tab}`}
              onClick={() => onChange({ ...state, activeTab: tab })}
              style={{
                padding: "6px 14px",
                background: active ? "#1F2235" : "transparent",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                color: active ? "#F4F7FF" : "#6B7CA8",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.02em",
                transition: "all 0.15s",
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Settings */}
      <button
        data-testid="btn-open-settings"
        onClick={onOpenSettings}
        title="Settings"
        aria-label="Open settings"
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          border: "1px solid #2a3060",
          background: "transparent",
          color: "#C7D2FE",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#1F2235";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        ⚙
      </button>

      {/* Export */}
      <ExportMenu
        state={state}
        exporting={exporting}
        onExportOverlay={onExportOverlay}
        onExportCover={onExportCover}
        onExportPoster={onExportPoster}
        onExportWallpaper={onExportWallpaper}
        onExportSidebar={onExportSidebar}
        onExportBottomBar={onExportBottomBar}
      />
    </header>
  );
}
