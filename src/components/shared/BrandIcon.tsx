import type { CSSProperties } from "react";
import {
  BRAND_ICON_REGISTRY,
  brandIconColor,
  type BrandIconKey,
  type BrandIconMode,
} from "../../lib/brand-icons";

interface BrandIconProps {
  iconKey?: BrandIconKey;
  mode?: BrandIconMode;
  color: string;
  size?: number;
  label?: string;
  style?: CSSProperties;
}

export function BrandIcon({
  iconKey,
  mode = "mono",
  color,
  size = 16,
  label,
  style,
}: BrandIconProps) {
  if (!iconKey) return null;
  const meta = BRAND_ICON_REGISTRY[iconKey];
  if (!meta) return null;
  const fill = mode === "brand" ? brandIconColor(iconKey) : color;

  return (
    <svg
      data-brand-icon={iconKey}
      aria-label={label ? `${label} icon` : `${meta.label} icon`}
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{
        display: "inline-block",
        flexShrink: 0,
        color: fill,
        ...style,
      }}
    >
      <path fill={fill} d={meta.icon.path} />
    </svg>
  );
}
