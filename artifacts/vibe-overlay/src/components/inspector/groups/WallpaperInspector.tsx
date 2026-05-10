import type { OverlayState } from "../../../types";
import InspectorGroup from "../InspectorGroup";
import BrandIdentityEditor from "../BrandIdentityEditor";
import { SectionInput, ToggleButton } from "../../shared/Field";
import { WALLPAPER_PRESETS, type WallpaperPresetId } from "../../../lib/wallpaper";

interface WallpaperInspectorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
}

/**
 * Wallpaper inspector. Title/avatar/badges live under Brand (shared with
 * Cover/Poster). The wallpaper-only fields — preview size + brand label +
 * slogan + element toggles — sit in their own groups below.
 */
export default function WallpaperInspector({
  state,
  onChange,
}: WallpaperInspectorProps) {
  const { wallpaper } = state;

  const writeWallpaper = (patch: Partial<OverlayState["wallpaper"]>) => {
    onChange({ ...state, wallpaper: { ...wallpaper, ...patch } });
  };

  const setPreset = (id: WallpaperPresetId) => {
    writeWallpaper({ previewPresetId: id });
  };

  return (
    <>
      <InspectorGroup
        title="Brand"
        hint="Avatar · title · agent badges (shared)"
        testId="group-wallpaper-brand"
      >
        <BrandIdentityEditor
          state={state}
          onChange={onChange}
          testIdPrefix="wallpaper"
        />
      </InspectorGroup>

      <InspectorGroup
        title="Preview Size"
        hint="Pick which size renders in the stage"
        testId="group-wallpaper-size"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            background: "#0F1122",
            padding: 3,
            borderRadius: 6,
            border: "1px solid #1F2235",
          }}
        >
          {WALLPAPER_PRESETS.map((preset) => {
            const active = wallpaper.previewPresetId === preset.id;
            return (
              <button
                key={preset.id}
                data-testid={`wallpaper-preset-${preset.id}`}
                onClick={() => setPreset(preset.id)}
                style={{
                  padding: "6px 0",
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
                {preset.shortLabel}
                <span
                  style={{
                    display: "block",
                    fontSize: 9,
                    fontWeight: 400,
                    color: active ? "#8DA8FF" : "#3a4060",
                    marginTop: 2,
                    letterSpacing: "0.02em",
                  }}
                >
                  {preset.width}×{preset.height}
                </span>
              </button>
            );
          })}
        </div>
      </InspectorGroup>

      <InspectorGroup
        title="Brand Label & Slogan"
        hint="Wallpaper-only copy"
        testId="group-wallpaper-copy"
      >
        <ToggleButton
          label="Show Brand Label"
          checked={wallpaper.brandLabelVisible}
          onChange={(v) => writeWallpaper({ brandLabelVisible: v })}
          testId="wallpaper-brand-visible"
        />
        {wallpaper.brandLabelVisible && (
          <SectionInput
            label="Brand Label"
            value={wallpaper.brandLabel}
            onChange={(v) => writeWallpaper({ brandLabel: v })}
            testId="wallpaper-brand-label"
            placeholder="VIBE CODING"
          />
        )}

        <ToggleButton
          label="Show Slogan"
          checked={wallpaper.sloganVisible}
          onChange={(v) => writeWallpaper({ sloganVisible: v })}
          testId="wallpaper-slogan-visible"
        />
        {wallpaper.sloganVisible && (
          <SectionInput
            label="Slogan"
            value={wallpaper.slogan}
            onChange={(v) => writeWallpaper({ slogan: v })}
            testId="wallpaper-slogan"
            placeholder="Build clearly. Ship loudly."
          />
        )}
      </InspectorGroup>

      <InspectorGroup
        title="Visibility"
        hint="Toggle wallpaper elements"
        testId="group-wallpaper-visibility"
      >
        <ToggleButton
          label="Show Avatar"
          checked={wallpaper.avatarVisible}
          onChange={(v) => writeWallpaper({ avatarVisible: v })}
          testId="wallpaper-avatar-visible"
        />
        <ToggleButton
          label="Show Agent Badges"
          checked={wallpaper.badgesVisible}
          onChange={(v) => writeWallpaper({ badgesVisible: v })}
          testId="wallpaper-badges-visible"
        />
        <ToggleButton
          label="Show Social Card"
          checked={wallpaper.socialVisible}
          onChange={(v) => writeWallpaper({ socialVisible: v })}
          testId="wallpaper-social-visible"
        />
      </InspectorGroup>
    </>
  );
}
