import assert from "node:assert/strict";
import test from "node:test";
import { summarizeConfigProposal } from "./config-proposal";

const base = JSON.stringify({
  version: 1,
  title: "A",
  subtitle: "S",
  author: "Me",
  profile: { avatarUrl: "/a.png", avatarVisible: true },
  cover: { visual: "avatar" },
  badges: ["x"],
  stack: ["a", "b"],
  socials: [],
  sections: [{ title: "1", bullets: [] }],
});

test("summarizeConfigProposal lists changed top-level v1 fields with array counts", () => {
  const proposed = JSON.stringify({
    ...JSON.parse(base),
    title: "B",
    stack: ["a", "b", "c"],
    sections: [
      { title: "1", bullets: [] },
      { title: "2", bullets: [] },
    ],
  });
  const result = summarizeConfigProposal(base, proposed);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const byField = Object.fromEntries(result.changes.map((c) => [c.field, c.count ?? null]));
  assert.deepEqual(Object.keys(byField).sort(), ["sections", "stack", "title"]);
  assert.equal(byField.title, null); // scalar → no count
  assert.equal(byField.stack, 3);
  assert.equal(byField.sections, 2);
});

test("summarizeConfigProposal returns no changes for an identical config", () => {
  const result = summarizeConfigProposal(base, base);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.changes, []);
});

test("summarizeConfigProposal ignores object key order for nested v1 fields", () => {
  const current = JSON.stringify({
    version: 1,
    profile: { avatarUrl: "/avatar.png", avatarVisible: true },
    cover: { visual: "avatar", portraitUrl: "/portrait.png" },
  });
  const proposed = JSON.stringify({
    version: 1,
    profile: { avatarVisible: true, avatarUrl: "/avatar.png" },
    cover: { portraitUrl: "/portrait.png", visual: "avatar" },
  });
  const result = summarizeConfigProposal(current, proposed);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.changes, []);
});

test("summarizeConfigProposal flags invalid / non-v1 proposals as not summarizable", () => {
  assert.deepEqual(summarizeConfigProposal(base, "{not json"), { ok: false });
  assert.deepEqual(summarizeConfigProposal(base, JSON.stringify({ title: "x" })), { ok: false });
  assert.deepEqual(summarizeConfigProposal(base, JSON.stringify({ version: 2, title: "x" })), { ok: false });
  assert.deepEqual(summarizeConfigProposal(base, JSON.stringify([1, 2, 3])), { ok: false });
});

test("summarizeConfigProposal treats an unparseable current projection as empty", () => {
  const proposed = JSON.stringify({ version: 1, title: "A" });
  const result = summarizeConfigProposal("{bad", proposed);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.changes.some((c) => c.field === "title"));
});
