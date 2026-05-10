import { forwardRef } from "react";
import { OverlayState } from "../types";
import { fontFamilies, typography } from "../lib/typography";
import { badgeIconUrl } from "../lib/badges";
import SocialList from "./SocialList";

interface PosterCanvasProps {
  state: OverlayState;
}

/* ── Editorial palette (shared with CoverCanvas) ─────────────── */
const E = {
  bg1: "#0B1020",
  bg2: "#111827",
  text: "#F5F5F2",
  muted: "#C7C9D1",
  subtle: "#5A6178",
  accent: "#DA7756",
  glassBorder: "rgba(255, 255, 255, 0.06)",
} as const;

const AVATAR_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E2438"/>
      <stop offset="100%" stop-color="#2A3350"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="100" fill="url(#g)"/>
  <text x="100" y="118" text-anchor="middle" font-family="system-ui,sans-serif"
    font-size="56" font-weight="500" fill="rgba(245,245,242,0.5)">VC</text>
</svg>
`)}`;

const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  ({ state }, ref) => {
    const { cover } = state;

    const avatarSrc = cover.avatarUrl || AVATAR_PLACEHOLDER;
    const hasOptionalContent =
      cover.manifestoVisible || cover.closingVisible;

    return (
      <div
        ref={ref}
        data-testid="cover-canvas"
        style={{
          width: 1920,
          height: 1080,
          position: "relative",
          background: `linear-gradient(170deg, ${E.bg2} 0%, ${E.bg1} 55%, #0A0E1A 100%)`,
          fontFamily: fontFamilies.sans,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
            `,
            backgroundSize: "128px 128px",
            pointerEvents: "none",
          }}
        />

        {/* Left-biased radial glow behind title */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 80% 90% at 35% 50%, ${E.bg2}F0 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />

        {/* Warm accent glow behind avatar */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 50% 60% at 78% 48%, ${E.accent}12 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />

        {/* ── Ghost UI corners ── */}

        {/* Bottom-left: commit graph */}
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: 120,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            pointerEvents: "none",
          }}
        >
          {[180, 140, 200, 120, 160].map((w, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    i === 0 ? `${E.accent}55` : "rgba(255,255,255,0.10)",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  height: 2,
                  width: w,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 1,
                }}
              />
            </div>
          ))}
        </div>

        {/* Top-right: chat panel */}
        <div
          style={{
            position: "absolute",
            top: 96,
            right: 96,
            width: 280,
            height: 180,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
            pointerEvents: "none",
          }}
        >
          {[60, 45, 75, 50].map((w, i) => (
            <div
              key={i}
              style={{
                margin: `${i === 0 ? 18 : 14}px ${i % 2 === 0 ? "auto" : "16px"} 0 ${i % 2 === 0 ? "16px" : "auto"}`,
                height: 14,
                width: `${w}%`,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 7,
              }}
            />
          ))}
        </div>

        {/* Top accent bar (paired with bottom) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent 15%, ${E.accent}55 50%, transparent 85%)`,
          }}
        />

        {/* Bottom accent bar (mirrored) */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent 15%, ${E.accent}55 50%, transparent 85%)`,
          }}
        />

        {/* Vertical column divider */}
        <div
          style={{
            position: "absolute",
            top: 200,
            bottom: 200,
            left: 1120,
            width: 1,
            background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 70%, transparent)`,
          }}
        />

        {/* ── LEFT COLUMN ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1120,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 96px 0 160px",
          }}
        >
          {/* Badge window — small macOS-styled chip aligned to title's left
              edge. Sized by content, not pinned to TODAY'S BUILD width, so
              it reads as a supporting "dev environment" cue rather than a
              hero element. */}
          <div
            style={{
              alignSelf: "flex-start",
              background: "rgba(17, 24, 39, 0.50)",
              border: `1px solid ${E.glassBorder}`,
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: hasOptionalContent ? 28 : 32,
            }}
          >
            {/* Window titlebar with macOS traffic lights */}
            <div
              style={{
                height: 24,
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                gap: 8,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,95,87,0.6)" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(254,188,46,0.6)" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(40,200,64,0.6)" }} />
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 9,
                  color: `${E.muted}40`,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  paddingRight: 31 /* balance traffic-light width */,
                }}
              >
                session
              </div>
            </div>

            {/* Badge body row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 12px",
              }}
            >
              {cover.badges
                .filter((b) => b.visible)
                .map((badge, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    {i > 0 && (
                      <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, marginRight: 1 }}>
                        ×
                      </span>
                    )}
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 4,
                      }}
                    >
                      {badgeIconUrl(badge) && (
                        <img
                          src={badgeIconUrl(badge)}
                          alt={badge.label}
                          style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.75 }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: `${E.muted}AA`,
                        fontWeight: 500,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                ))}

              <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.10)", margin: "0 2px" }} />

              {/* LIVE pill — small, sits inline with badges */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(230,33,23,0.85)",
                  borderRadius: 999,
                  padding: "0 9px",
                  height: 20,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.95)",
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.12em",
                  }}
                >
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Eyebrow — hookText */}
          {cover.hookVisible && cover.hookText && (
            <div
              style={{
                ...typography.eyebrow,
                color: E.subtle,
                letterSpacing: "0.18em",
                marginBottom: 18,
              }}
            >
              {cover.hookText}
            </div>
          )}

          {/* Main title — serif, editorial */}
          <h1
            style={{
              fontFamily: fontFamilies.serif,
              fontSize: hasOptionalContent ? 88 : 96,
              fontWeight: 600,
              color: E.text,
              letterSpacing: "-0.015em",
              lineHeight: 1.05,
              margin: 0,
              marginBottom: 40,
            }}
          >
            {cover.title}
          </h1>

          {/* Today's topic card */}
          <div
            style={{
              width: 720,
              boxSizing: "border-box",
              background: "rgba(17, 24, 39, 0.85)",
              border: `1px solid ${E.glassBorder}`,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
              borderRadius: 14,
              padding: "20px 32px 22px",
              position: "relative",
              marginBottom: hasOptionalContent ? 36 : 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 32,
                width: 60,
                height: 1.5,
                background: `${E.accent}80`,
                borderRadius: 1,
              }}
            />
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: E.subtle,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {cover.todayLabel}
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: E.text,
                lineHeight: 1.3,
                letterSpacing: "0.01em",
              }}
            >
              {cover.todayTopic}
            </div>
          </div>

          {/* Optional section divider */}
          {hasOptionalContent && (
            <div
              style={{
                width: 36,
                height: 1.5,
                background: `linear-gradient(90deg, ${E.accent}55, transparent)`,
                marginBottom: 28,
                borderRadius: 1,
              }}
            />
          )}

          {/* Manifesto — optional, serif (matches main title family) */}
          {cover.manifestoVisible && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                marginBottom: cover.closingVisible ? 28 : 0,
              }}
            >
              {[cover.manifestoLine1, cover.manifestoLine2, cover.manifestoLine3].map(
                (line, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: fontFamilies.serif,
                      fontSize: 48,
                      lineHeight: 1.05,
                      fontWeight: 600,
                      letterSpacing: "-0.015em",
                      color: E.text,
                    }}
                  >
                    {line}
                  </div>
                )
              )}
            </div>
          )}

          {/* Closing sentence — optional */}
          {cover.closingVisible && (
            <div
              style={{
                fontSize: 20,
                color: E.muted,
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "0 6px",
                lineHeight: 1.6,
                opacity: 0.9,
              }}
            >
              <span>{cover.closingPrefix}</span>
              <span
                style={{
                  textDecoration: "line-through",
                  textDecorationColor: `${E.accent}80`,
                  textDecorationThickness: 2,
                  color: E.subtle,
                }}
              >
                {cover.closingStruck}
              </span>
              <span style={{ color: E.accent, fontWeight: 600 }}>
                {cover.closingHighlight}
              </span>
              <span style={{ color: `${E.muted}80` }}>{cover.closingSuffix}</span>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — avatar + optional social info ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 800,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          {/* Avatar — editorial, simple inner hairline ring (no conic gradient) */}
          {cover.avatarVisible && (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.08)",
                  zIndex: 0,
                }}
              />
              <img
                src={avatarSrc}
                alt="Avatar"
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: 260,
                  height: 260,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {/* Faint screen-light reflection */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 180,
                  height: 52,
                  background:
                    "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.05), transparent 80%)",
                  borderRadius: "50%",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            </div>
          )}

          {/* Social info block */}
          {cover.socialVisible && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "stretch",
                padding: "28px 36px",
                background: "rgba(17, 24, 39, 0.78)",
                border: `1px solid ${E.glassBorder}`,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                borderRadius: 14,
                minWidth: 340,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: E.subtle,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <div style={{ width: 3, height: 12, borderRadius: 2, background: E.accent, flexShrink: 0 }} />
                Follow me
              </div>
              <SocialList state={state} size="large" />
            </div>
          )}
        </div>
      </div>
    );
  },
);

PosterCanvas.displayName = "PosterCanvas";
export default PosterCanvas;
