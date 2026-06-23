import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_STATE } from "../types";
import { searchBadgeIcons } from "./badges";
import { normalizeOverlayState } from "../stateStorage";
import { BadgeIcon } from "../components/shared/BadgeIcon";
import BadgeToolbar from "../components/shared/BadgeToolbar";

test("old badge kind entries migrate to iconKey without requiring custom URLs", () => {
  const state = normalizeOverlayState({
    cover: {
      badges: [
        { visible: true, kind: "claude", label: "Claude", customIconUrl: "" },
        { visible: true, kind: "codex", label: "Codex", customIconUrl: "" },
      ],
    },
  });

  assert.equal(state.cover.badges[0].iconKey, "claude");
  assert.equal(state.cover.badges[1].iconKey, "codex");
  assert.equal(state.cover.badges[0].iconMode, "brand");
  assert.equal(state.cover.badges[0].customIconUrl, "");
});

test("default badges are registry-backed and do not contain custom icon URLs", () => {
  for (const badge of DEFAULT_STATE.cover.badges) {
    assert.notEqual(badge.iconKey, "custom");
    assert.equal(badge.customIconUrl, "");
    assert.equal(badge.iconMode, "brand");
  }
});

test("BadgeIcon mono mode follows the supplied theme color", () => {
  const html = renderToStaticMarkup(
    React.createElement(BadgeIcon, {
      iconKey: "claude",
      mode: "mono",
      color: "#e0815c",
      size: 18,
    }),
  );

  assert.match(html, /color:#e0815c/);
});

test("BadgeIcon brand mode uses the official LobeHub combined color mark", () => {
  const html = renderToStaticMarkup(
    React.createElement(BadgeIcon, {
      iconKey: "claude",
      mode: "brand",
      color: "#ece3d6",
      size: 18,
    }),
  );

  assert.match(html, /data-badge-icon-combine="claude"/);
  assert.match(html, /<svg/);
  assert.match(html, /fill="#[0-9A-Fa-f]{6}"/);
  assert.doesNotMatch(html, /data-badge-icon-surface/);
});

test("Kimi brand icon uses Combine color artwork instead of a custom surface", () => {
  const html = renderToStaticMarkup(
    React.createElement(BadgeIcon, {
      iconKey: "kimi",
      mode: "brand",
      color: "#1a1a1a",
      size: 18,
    }),
  );

  assert.match(html, /data-badge-icon-combine="kimi"/);
  assert.match(html, /fill="#1783FF"/);
  assert.doesNotMatch(html, /data-badge-icon-surface/);
  assert.doesNotMatch(html, /background:#1783FF/);
});

test("BadgeToolbar renders inline registry icons instead of remote image URLs", () => {
  const html = renderToStaticMarkup(
    React.createElement(BadgeToolbar, {
      badges: [
        { visible: true, iconKey: "claude", iconMode: "mono", label: "Claude", customIconUrl: "" },
        { visible: true, iconKey: "codex", iconMode: "mono", label: "Codex", customIconUrl: "" },
      ],
      readonly: true,
      labelColor: "#ece3d6",
    }),
  );

  assert.doesNotMatch(html, /<img\b/);
  assert.doesNotMatch(html, /<img[^>]+src=/);
  assert.doesNotMatch(html, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
  assert.doesNotMatch(html, /\/icons\//);
  assert.match(html, /aria-label="Claude icon"/);
});



test("BadgeToolbar uses combined brand marks without duplicating labels", () => {
  const html = renderToStaticMarkup(
    React.createElement(BadgeToolbar, {
      badges: [
        { visible: true, iconKey: "kimi", iconMode: "brand", label: "Kimi", customIconUrl: "" },
        { visible: true, iconKey: "codex", iconMode: "brand", label: "Codex", customIconUrl: "" },
      ],
      readonly: true,
      labelColor: "#1a1a1a",
    }),
  );

  assert.match(html, /data-badge-icon-combine="kimi"/);
  assert.match(html, /data-badge-icon-combine="codex"/);
  assert.doesNotMatch(html, /aria-label="Badge 1 label"/);
  assert.doesNotMatch(html, /aria-label="Badge 2 label"/);
});

test("badge icon search covers mainstream AI and coding tools", () => {
  const cases = [
    ["kimi", "kimi"],
    ["moonshot", "moonshot"],
    ["z.ai", "z-ai"],
    ["junie", "junie"],
    ["minimx", "minimax"],
    ["opencode", "opencode"],
    ["antigravity", "antigravity"],
    ["chatgpt", "chatgpt"],
  ];

  for (const [query, expected] of cases) {
    const keys = searchBadgeIcons(query).map((item) => item.iconKey);
    assert.ok(
      keys.includes(expected as never),
      `${query} should find ${expected}; got ${keys.join(", ")}`,
    );
  }
});
