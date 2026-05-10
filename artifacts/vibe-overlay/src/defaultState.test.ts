import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_STATE_BY_LOCALE } from "./types";

test("zh defaults show the localized social links in display order", () => {
  assert.deepEqual(
    DEFAULT_STATE_BY_LOCALE.zh.cover.socials.map((social) => ({
      visible: social.visible,
      kind: social.kind,
      label: social.label,
      value: social.value,
    })),
    [
      {
        visible: true,
        kind: "bilibili",
        label: "B站",
        value: "http://live.bilibili.com/22566414",
      },
      {
        visible: true,
        kind: "blog",
        label: "个人网站",
        value: "https://aklman.com",
      },
      {
        visible: true,
        kind: "qq",
        label: "QQ群",
        value: "205359827",
      },
      {
        visible: true,
        kind: "wechat",
        label: "微信",
        value: "aklman1",
      },
      {
        visible: true,
        kind: "github",
        label: "GitHub",
        value: "https://github.com/aklmans",
      },
    ],
  );
});

test("en defaults show the localized social links in display order", () => {
  assert.deepEqual(
    DEFAULT_STATE_BY_LOCALE.en.cover.socials.map((social) => ({
      visible: social.visible,
      kind: social.kind,
      label: social.label,
      value: social.value,
    })),
    [
      {
        visible: true,
        kind: "youtube",
        label: "YouTube",
        value: "https://www.youtube.com/@aklman2018",
      },
      {
        visible: true,
        kind: "blog",
        label: "Website",
        value: "https://aklman.com",
      },
      {
        visible: true,
        kind: "discord",
        label: "Discord",
        value: "https://discord.gg/UJjzvHck",
      },
      {
        visible: true,
        kind: "x",
        label: "X",
        value: "https://x.com/Aklman2018",
      },
      {
        visible: true,
        kind: "github",
        label: "GitHub",
        value: "https://github.com/aklmans",
      },
    ],
  );
});
