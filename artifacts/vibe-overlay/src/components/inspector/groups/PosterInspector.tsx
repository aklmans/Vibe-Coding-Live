import type { OverlayState } from "../../../types";
import InspectorGroup from "../InspectorGroup";
import BrandIdentityEditor from "../BrandIdentityEditor";
import { SectionInput, ToggleButton } from "../../shared/Field";
import SocialsEditor from "../../SocialsEditor";

interface PosterInspectorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
}

export default function PosterInspector({
  state,
  onChange,
}: PosterInspectorProps) {
  const writeCover = (patch: Partial<OverlayState["cover"]>) => {
    onChange({ ...state, cover: { ...state.cover, ...patch } });
  };

  return (
    <>
      <InspectorGroup
        title="Brand"
        hint="Avatar · title · agent badges (shared)"
        testId="group-poster-brand"
      >
        <BrandIdentityEditor
          state={state}
          onChange={onChange}
          testIdPrefix="poster"
        />
      </InspectorGroup>

      <InspectorGroup
        title="Today's Build"
        hint="Card label + topic copy"
        testId="group-poster-today"
      >
        <SectionInput
          label="Card Label"
          value={state.cover.todayLabel}
          onChange={(v) => writeCover({ todayLabel: v })}
          testId="poster-today-label"
        />
        <SectionInput
          label="Topic"
          value={state.cover.todayTopic}
          onChange={(v) => writeCover({ todayTopic: v })}
          testId="poster-today-topic"
        />
      </InspectorGroup>

      <InspectorGroup
        title="Manifesto"
        hint="3-line block"
        testId="group-poster-manifesto"
        defaultOpen={false}
      >
        <ToggleButton
          label="Show Manifesto"
          checked={state.cover.manifestoVisible}
          onChange={(v) => writeCover({ manifestoVisible: v })}
          testId="poster-manifesto-visible"
        />
        {state.cover.manifestoVisible && (
          <>
            <SectionInput
              label="Line 1"
              value={state.cover.manifestoLine1}
              onChange={(v) => writeCover({ manifestoLine1: v })}
              testId="poster-manifesto-1"
            />
            <SectionInput
              label="Line 2"
              value={state.cover.manifestoLine2}
              onChange={(v) => writeCover({ manifestoLine2: v })}
              testId="poster-manifesto-2"
            />
            <SectionInput
              label="Line 3"
              value={state.cover.manifestoLine3}
              onChange={(v) => writeCover({ manifestoLine3: v })}
              testId="poster-manifesto-3"
            />
          </>
        )}
      </InspectorGroup>

      <InspectorGroup
        title="Hook Text"
        hint="Chinese subline below the title"
        testId="group-poster-hook"
        defaultOpen={false}
      >
        <ToggleButton
          label="Show Hook Text"
          checked={state.cover.hookVisible}
          onChange={(v) => writeCover({ hookVisible: v })}
          testId="poster-hook-visible"
        />
        {state.cover.hookVisible && (
          <SectionInput
            label="Chinese Hook"
            value={state.cover.hookText}
            onChange={(v) => writeCover({ hookText: v })}
            testId="poster-hook-text"
          />
        )}
      </InspectorGroup>

      <InspectorGroup
        title="Closing Line"
        hint="Advanced — prefix · struck · highlight · suffix"
        testId="group-poster-closing"
        defaultOpen={false}
      >
        <ToggleButton
          label="Show Closing Line"
          checked={state.cover.closingVisible}
          onChange={(v) => writeCover({ closingVisible: v })}
          testId="poster-closing-visible"
        />
        {state.cover.closingVisible && (
          <>
            <SectionInput
              label="Prefix"
              value={state.cover.closingPrefix}
              onChange={(v) => writeCover({ closingPrefix: v })}
              testId="poster-closing-prefix"
            />
            <SectionInput
              label="Strikethrough word"
              value={state.cover.closingStruck}
              onChange={(v) => writeCover({ closingStruck: v })}
              testId="poster-closing-struck"
            />
            <SectionInput
              label="Highlighted phrase"
              value={state.cover.closingHighlight}
              onChange={(v) => writeCover({ closingHighlight: v })}
              testId="poster-closing-highlight"
            />
            <SectionInput
              label="Suffix"
              value={state.cover.closingSuffix}
              onChange={(v) => writeCover({ closingSuffix: v })}
              testId="poster-closing-suffix"
            />
          </>
        )}
      </InspectorGroup>

      <InspectorGroup
        title="Socials"
        hint="Follow-me card under the title"
        testId="group-poster-socials"
      >
        <ToggleButton
          label="Show Social Info"
          checked={state.cover.socialVisible}
          onChange={(v) => writeCover({ socialVisible: v })}
          testId="poster-social-visible"
        />
        {state.cover.socialVisible && (
          <SocialsEditor
            state={state}
            onChange={onChange}
            testIdPrefix="poster-social"
          />
        )}
      </InspectorGroup>
    </>
  );
}
