import type { OverlayState } from "../../../types";
import InspectorGroup from "../InspectorGroup";
import BrandIdentityEditor from "../BrandIdentityEditor";
import { SectionInput, ToggleButton } from "../../shared/Field";
import SocialsEditor from "../../SocialsEditor";

interface CoverInspectorProps {
  state: OverlayState;
  onChange: (state: OverlayState) => void;
}

export default function CoverInspector({
  state,
  onChange,
}: CoverInspectorProps) {
  const writeCover = (patch: Partial<OverlayState["cover"]>) => {
    onChange({ ...state, cover: { ...state.cover, ...patch } });
  };

  return (
    <>
      <InspectorGroup
        title="Brand"
        hint="Avatar · title · subtitle · agent badges"
        testId="group-cover-brand"
      >
        <BrandIdentityEditor
          state={state}
          onChange={onChange}
          testIdPrefix="cover"
          showSubtitle
        />
      </InspectorGroup>

      <InspectorGroup
        title="Today's Build"
        hint="Card label + topic copy"
        testId="group-cover-today"
      >
        <SectionInput
          label="Card Label"
          value={state.cover.todayLabel}
          onChange={(v) => writeCover({ todayLabel: v })}
          testId="cover-today-label"
        />
        <SectionInput
          label="Topic"
          value={state.cover.todayTopic}
          onChange={(v) => writeCover({ todayTopic: v })}
          testId="cover-today-topic"
        />
      </InspectorGroup>

      <InspectorGroup
        title="Socials"
        hint="Visible only when toggled on"
        testId="group-cover-socials"
        defaultOpen={false}
      >
        <ToggleButton
          label="Show Social Card"
          checked={state.cover.socialVisible}
          onChange={(v) => writeCover({ socialVisible: v })}
          testId="cover-social-visible"
        />
        {state.cover.socialVisible && (
          <SocialsEditor
            state={state}
            onChange={onChange}
            testIdPrefix="cover-social"
          />
        )}
      </InspectorGroup>
    </>
  );
}
