import { InlineBadgeIcon } from "../../lib/badge-icons";
import type { BadgeIconKey, BadgeIconMode } from "../../lib/badges";

interface BadgeIconProps {
  iconKey: BadgeIconKey;
  mode?: BadgeIconMode;
  color: string;
  size?: number;
  opacity?: number;
  label?: string;
}

export function BadgeIcon({
  iconKey,
  mode = "mono",
  color,
  size = 18,
  opacity = 1,
  label,
}: BadgeIconProps) {
  return (
    <InlineBadgeIcon
      iconKey={iconKey}
      mode={mode}
      color={color}
      size={size}
      opacity={opacity}
      label={label}
    />
  );
}
