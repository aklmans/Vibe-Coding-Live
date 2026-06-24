import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BrandIcon } from "../components/shared/BrandIcon";
import {
  BRAND_ICON_OPTIONS,
  BRAND_ICON_PRESETS,
  inferBrandIconKey,
  searchBrandIconPresets,
  searchBrandIcons,
} from "./brand-icons";

test("brand icon registry covers common production and streaming tools", () => {
  assert.ok(BRAND_ICON_OPTIONS.length >= 40);

  const expected = [
    "claude",
    "cursor",
    "react",
    "vite",
    "nextdotjs",
    "obs",
    "youtube",
    "github",
    "typescript",
    "tailwindcss",
  ];

  for (const iconKey of expected) {
    assert.ok(
      BRAND_ICON_OPTIONS.some((icon) => icon.iconKey === iconKey),
      `missing ${iconKey}`,
    );
  }
});

test("brand icon search and inference understand stack labels", () => {
  assert.equal(searchBrandIcons("react")[0]?.iconKey, "react");
  assert.equal(searchBrandIcons("obs studio")[0]?.iconKey, "obs");
  assert.equal(inferBrandIconKey("React + Vite"), "react");
  assert.equal(inferBrandIconKey("Claude Opus 4.7"), "claude");
  assert.equal(inferBrandIconKey("OBS Studio"), "obs");
});

test("BrandIcon renders inline simple-icons paths in mono and brand modes", () => {
  const mono = renderToStaticMarkup(
    React.createElement(BrandIcon, {
      iconKey: "react",
      mode: "mono",
      color: "#e0815c",
      size: 18,
      label: "React",
    }),
  );
  assert.match(mono, /data-brand-icon="react"/);
  assert.match(mono, /fill="#e0815c"/);
  assert.doesNotMatch(mono, /<img/);

  const brand = renderToStaticMarkup(
    React.createElement(BrandIcon, {
      iconKey: "react",
      mode: "brand",
      color: "#111111",
      size: 18,
      label: "React",
    }),
  );
  assert.match(brand, /fill="#61DAFB"/);
});


test("brand icon presets cover common workflows and boost alias search", () => {
  assert.deepEqual(
    BRAND_ICON_PRESETS.map((preset) => preset.id),
    ["ai-agents", "frontend", "streaming", "social"],
  );

  assert.equal(searchBrandIconPresets("AI Agents")[0]?.id, "ai-agents");
  assert.equal(searchBrandIconPresets("前端")[0]?.id, "frontend");
  assert.equal(searchBrandIconPresets("直播")[0]?.id, "streaming");
  assert.equal(searchBrandIconPresets("社交")[0]?.id, "social");

  assert.equal(searchBrandIcons("ai agents")[0]?.iconKey, "claude");
  assert.equal(searchBrandIcons("frontend")[0]?.iconKey, "react");
  assert.equal(searchBrandIcons("直播")[0]?.iconKey, "obs");
  assert.equal(searchBrandIcons("social")[0]?.iconKey, "x");
});
