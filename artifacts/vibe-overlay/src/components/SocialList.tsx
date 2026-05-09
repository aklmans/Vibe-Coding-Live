import type { CSSProperties } from "react";
import type { OverlayState } from "../types";
import { socialStyle } from "../lib/socials";

type Size = "small" | "large";

interface SocialListProps {
  state: OverlayState;
  size?: Size;
}

/**
 * Shared renderer for the social-link list used by:
 *   - Sidebar export slice (size="small")
 *   - Overlay live sidebar (size="small")
 *   - Poster footer       (size="large")
 *
 * All three share the same alignment, label width, and border weight so a
 * style change here ripples to every canvas.
 */
export default function SocialList({ state, size = "small" }: SocialListProps) {
  const { cover, colors } = state;
  const { textColor } = colors;
  const visibleSocials = cover.socials.filter(
    (s) => s.visible && s.value.trim().length > 0,
  );
  if (visibleSocials.length === 0) return null;

  const isLarge = size === "large";
  const labelBase: CSSProperties = isLarge
    ? {
        fontSize: 14,
        fontWeight: 600,
        borderRadius: 5,
        padding: "4px 12px",
        flexShrink: 0,
        minWidth: 84,
        textAlign: "center",
        boxSizing: "border-box",
        letterSpacing: "0.04em",
        border: "1px solid transparent",
      }
    : {
        fontSize: 12,
        fontWeight: 700,
        borderRadius: 4,
        padding: "3px 8px",
        flexShrink: 0,
        minWidth: 76,
        textAlign: "center",
        boxSizing: "border-box",
        letterSpacing: "0.04em",
        border: "1px solid transparent",
      };

  const valueStyle: CSSProperties = isLarge
    ? {
        fontSize: 20,
        color: textColor,
        fontWeight: 500,
        letterSpacing: "0.01em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }
    : {
        fontSize: 14,
        color: textColor,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      };

  const rowGap = isLarge ? 14 : 10;

  return (
    <>
      {visibleSocials.map((social, idx) => {
        const style = socialStyle(social, colors);
        return (
          <div
            key={idx}
            style={{ display: "flex", alignItems: "center", gap: rowGap }}
          >
            <span style={{ ...labelBase, ...style }}>{social.label}</span>
            <span style={valueStyle}>{social.value}</span>
          </div>
        );
      })}
    </>
  );
}
