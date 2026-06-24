import {
  brandIconLabel,
  inferBrandIconKey,
  isBrandIconKey,
  isBrandIconMode,
  type BrandIconKey,
  type BrandIconMode,
} from "./brand-icons";

export interface StackItem {
  label: string;
  iconKey?: BrandIconKey;
  iconMode: BrandIconMode;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function createStackItem(
  label: string,
  iconKey: BrandIconKey | undefined = inferBrandIconKey(label),
  iconMode: BrandIconMode = "mono",
): StackItem {
  return {
    label: label.trim(),
    iconKey,
    iconMode,
  };
}

export function stackItemLabel(item: StackItem | string): string {
  return typeof item === "string" ? item : item.label;
}

export function normalizeStackItem(value: unknown): StackItem | null {
  if (typeof value === "string") {
    const label = value.trim();
    return label ? createStackItem(label) : null;
  }

  const source = record(value);
  if (!source) return null;
  const label = typeof source.label === "string" ? source.label.trim() : "";
  if (!label) return null;
  const iconKey = isBrandIconKey(source.iconKey)
    ? source.iconKey
    : inferBrandIconKey(label);
  const iconMode = isBrandIconMode(source.iconMode) ? source.iconMode : "mono";
  return { label, iconKey, iconMode };
}

export function normalizeStackItems(
  value: unknown,
  fallback: StackItem[],
): StackItem[] {
  if (!Array.isArray(value)) return fallback.map((item) => ({ ...item }));
  return value
    .map(normalizeStackItem)
    .filter((item): item is StackItem => Boolean(item));
}

export function stackItemsToLabels(items: Array<StackItem | string>): string[] {
  return items.map(stackItemLabel);
}

export function stackItemTitle(item: StackItem): string {
  return item.iconKey ? brandIconLabel(item.iconKey) : item.label;
}
