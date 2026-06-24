import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BrandIcon } from "../components/shared/BrandIcon";
import {
  BRAND_ICON_OPTIONS,
  inferBrandIconKey,
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
