import type { OverlayState } from "../../types";
import AvatarUploader from "../shared/AvatarUploader";
import { SectionInput } from "../shared/Field";
import BadgesEditor from "../BadgesEditor";

interface BrandIdentityEditorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
  testIdPrefix: string;
  /** Some surfaces (Cover) want a subtitle; Poster/Wallpaper don't. */
  showSubtitle?: boolean;
}

/**
 * Shared "who am I" editor used by Cover, Poster, and Wallpaper inspectors.
 * Holds avatar + title + (optional subtitle/hookText) + agent badges. All of
 * these live under `state.cover` so changes show up in every surface.
 */
export default function BrandIdentityEditor({
  state,
  onChange,
  testIdPrefix,
  showSubtitle = false,
}: BrandIdentityEditorProps) {
  const writeCover = (patch: Partial<OverlayState["cover"]>) => {
    onChange({ ...state, cover: { ...state.cover, ...patch } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <AvatarUploader
        url={state.cover.avatarUrl}
        visible={state.cover.avatarVisible}
        onUrlChange={(v) => writeCover({ avatarUrl: v })}
        onVisibleChange={(v) => writeCover({ avatarVisible: v })}
        testIdPrefix={`${testIdPrefix}-avatar`}
      />

      <SectionInput
        label="Title"
        value={state.cover.title}
        onChange={(v) => writeCover({ title: v })}
        testId={`${testIdPrefix}-title`}
      />

      {showSubtitle && (
        <SectionInput
          label="Subtitle"
          value={state.cover.hookText}
          onChange={(v) => writeCover({ hookText: v })}
          testId={`${testIdPrefix}-subtitle`}
        />
      )}

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
          Agent Badges
        </span>
        <BadgesEditor
          state={state}
          onChange={onChange}
          testIdPrefix={`${testIdPrefix}-badge`}
        />
      </div>

      <div
        style={{
          fontSize: 10,
          color: "#6B7CA8",
          lineHeight: 1.5,
          padding: "8px 10px",
          background: "#0F1122",
          border: "1px dashed #1F2235",
          borderRadius: 6,
        }}
      >
        Avatar · Title · Badges 在 Cover · Poster · Wallpaper 之间共享，改一处三处都生效。
      </div>
    </div>
  );
}
