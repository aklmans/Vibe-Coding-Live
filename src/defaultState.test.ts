import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_STATE_BY_LOCALE } from "./types";

test("zh defaults show the localized social links in display order", () => {
  assert.deepEqual(
    DEFAULT_STATE_BY_LOCALE.zh.cover.socials.map((social) => ({
      visible: social.visible,
      iconKey: social.iconKey,
      iconMode: social.iconMode,
      label: social.label,
      value: social.value,
    })),
    [
      {
        visible: true,
        iconKey: "bilibili",
        iconMode: "mono",
        label: "B站",
        value: "Aklman",
      },
      {
        visible: true,
        iconKey: "website",
        iconMode: "mono",
        label: "个人网站",
        value: "example.com",
      },
      {
        visible: true,
        iconKey: "qq",
        iconMode: "mono",
        label: "QQ群",
        value: "123456789",
      },
      {
        visible: true,
        iconKey: "wechat",
        iconMode: "mono",
        label: "微信",
        value: "demo-live",
      },
      {
        visible: true,
        iconKey: "github",
        iconMode: "mono",
        label: "GitHub",
        value: "demo-org/vibe-live",
      },
    ],
  );
});

test("en defaults show the localized social links in display order", () => {
  assert.deepEqual(
    DEFAULT_STATE_BY_LOCALE.en.cover.socials.map((social) => ({
      visible: social.visible,
      iconKey: social.iconKey,
      iconMode: social.iconMode,
      label: social.label,
      value: social.value,
    })),
    [
      {
        visible: true,
        iconKey: "youtube",
        iconMode: "mono",
        label: "YouTube",
        value: "@demo-live",
      },
      {
        visible: true,
        iconKey: "website",
        iconMode: "mono",
        label: "Website",
        value: "example.com",
      },
      {
        visible: true,
        iconKey: "discord",
        iconMode: "mono",
        label: "Discord",
        value: "demo-live",
      },
      {
        visible: true,
        iconKey: "x",
        iconMode: "mono",
        label: "X",
        value: "@demo_live",
      },
      {
        visible: true,
        iconKey: "github",
        iconMode: "mono",
        label: "GitHub",
        value: "demo-org/vibe-live",
      },
    ],
  );
});

test("defaults keep Aklman as the demo host but avoid personal social handles", () => {
  const defaults = JSON.stringify(DEFAULT_STATE_BY_LOCALE);

  assert.match(defaults, /Aklman/);
  for (const privateValue of [
    ["aklman", ".com"].join(""),
    ["aklman", "1"].join(""),
    ["aklman", "s"].join(""),
    ["@", "aklman", "2018"].join(""),
    ["@", "Aklman", "2018"].join(""),
    ["205", "359", "827"].join(""),
  ]) {
    assert.doesNotMatch(defaults, new RegExp(privateValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
});
