/**
 * A pure, dependency-free diff between the current v1 config projection and a
 * proposed config returned by the Agent. It only reports which top-level v1
 * fields would change — enough for the Agent's proposal review rail to tell the
 * user "what this would change" before they open the drift-safe JSON drawer.
 * It never applies anything and never touches OverlayState.
 */

/** A single top-level v1 field that differs between current and proposed. */
export interface ConfigChange {
  field: "title" | "subtitle" | "author" | "profile" | "cover" | "badges" | "stack" | "socials" | "sections";
  /** Item count for array fields (badges / stack / socials / sections). */
  count?: number;
}

export type ProposalSummary = { ok: true; changes: ConfigChange[] } | { ok: false };

const FIELDS: ConfigChange["field"][] = [
  "title",
  "subtitle",
  "author",
  "profile",
  "cover",
  "badges",
  "stack",
  "socials",
  "sections",
];

const ARRAY_FIELDS = new Set<ConfigChange["field"]>(["badges", "stack", "socials", "sections"]);

function parseConfigObject(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text) as unknown;
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function normalizeForCompare(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeForCompare);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, normalizeForCompare(record[key])]),
    );
  }
  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeForCompare(value));
}

/**
 * List the top-level v1 fields that the proposed config would change relative to
 * the current projection. Returns `{ ok: false }` when the proposed text is not
 * a parseable v1 config object — the caller still allows Review in JSON, just
 * without a summary. An unparseable *current* projection is treated as empty
 * (so every present field reads as changed).
 */
export function summarizeConfigProposal(
  currentConfigText: string,
  proposedConfigText: string,
): ProposalSummary {
  const proposed = parseConfigObject(proposedConfigText);
  if (!proposed || proposed.version !== 1) return { ok: false };
  const current = parseConfigObject(currentConfigText) ?? {};

  const changes: ConfigChange[] = [];
  for (const field of FIELDS) {
    const before = stableStringify(current[field] ?? null);
    const after = stableStringify(proposed[field] ?? null);
    if (before === after) continue;
    const value = proposed[field];
    const count = ARRAY_FIELDS.has(field) && Array.isArray(value) ? value.length : undefined;
    changes.push(count === undefined ? { field } : { field, count });
  }
  return { ok: true, changes };
}
