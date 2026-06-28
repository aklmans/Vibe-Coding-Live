import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_STATE } from "../types";
import { buildAgentPrompt } from "./agent-prompt";

test("buildAgentPrompt redacts social values in copy handoff prompts", () => {
  const prompt = buildAgentPrompt(
    {
      ...DEFAULT_STATE,
      cover: {
        ...DEFAULT_STATE.cover,
        socials: [
          { visible: true, iconKey: "github", iconMode: "mono", label: "GitHub", value: "private-handoff-social", customColor: "" },
        ],
      },
    },
    "prepare a stream",
    "Task: update sections",
  );

  assert.match(prompt, /__PRIVATE_SOCIAL_VALUE_0__/);
  assert.match(prompt, /keep those placeholders/);
  assert.equal(prompt.includes("private-handoff-social"), false);
});
