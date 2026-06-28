export const PRIVATE_SOCIAL_VALUE_PREFIX = "__PRIVATE_SOCIAL_VALUE_";

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function privateSocialValuePlaceholder(index: number): string {
  return `${PRIVATE_SOCIAL_VALUE_PREFIX}${index}__`;
}

export function privateSocialValuePlaceholderIndex(value: string): number | null {
  const match = value.match(/^__PRIVATE_SOCIAL_VALUE_(\d+)__$/);
  if (!match) return null;
  const index = Number.parseInt(match[1], 10);
  return Number.isInteger(index) && index >= 0 ? index : null;
}

export function isPrivateSocialValuePlaceholder(value: string): boolean {
  return privateSocialValuePlaceholderIndex(value) !== null;
}

export function redactPrivateSocialValuesInConfigText(configText: string): string {
  const config = parseConfig(configText);
  if (!config) return fallbackPrivateConfigText();

  if (Array.isArray(config.socials)) {
    config.socials = config.socials.map((item, index) => {
      const social = record(item);
      if (!social || typeof social.value !== "string" || !social.value.trim()) {
        return item;
      }
      return {
        ...social,
        value: privateSocialValuePlaceholder(index),
      };
    });
  }

  return `${JSON.stringify(config, null, 2)}\n`;
}

export function restorePrivateSocialValuesInConfigText(
  configText: string,
  originalConfigText: string,
): string {
  const config = parseConfig(configText);
  const original = parseConfig(originalConfigText);
  if (!config || !original || !Array.isArray(config.socials) || !Array.isArray(original.socials)) {
    return configText;
  }

  const originalSocials = original.socials;
  config.socials = config.socials.map((item) => {
    const social = record(item);
    if (!social || typeof social.value !== "string") return item;
    const originalIndex = privateSocialValuePlaceholderIndex(social.value);
    if (originalIndex === null) return item;
    const originalSocial = record(originalSocials[originalIndex]);
    const originalValue = typeof originalSocial?.value === "string" ? originalSocial.value : "";
    return originalValue ? { ...social, value: originalValue } : item;
  });

  return `${JSON.stringify(config, null, 2)}\n`;
}

function parseConfig(configText: string): Record<string, unknown> | null {
  try {
    return record(JSON.parse(configText));
  } catch {
    return null;
  }
}

function fallbackPrivateConfigText(): string {
  return `${JSON.stringify(
    {
      version: 1,
      title: "Privacy-safe config unavailable",
      subtitle: "",
      badges: [],
      stack: [],
      socials: [],
      sections: [],
    },
    null,
    2,
  )}\n`;
}
