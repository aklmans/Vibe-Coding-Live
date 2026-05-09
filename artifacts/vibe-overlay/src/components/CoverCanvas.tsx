import { forwardRef } from "react";
import { OverlayState } from "../types";

interface CoverCanvasProps {
  state: OverlayState;
}

/* ── Cover-specific editorial palette ──────────────────────────── */
const C = {
  bg1: "#0B1020",
  bg2: "#111827",
  text: "#F5F5F2",
  muted: "#C7C9D1",
  subtle: "#5A6178",
  accent: "#DA7756",
  glass: "rgba(17, 24, 39, 0.65)",
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

const CoverCanvas = forwardRef<HTMLDivElement, CoverCanvasProps>(
  ({ state }, ref) => {
    const { cover } = state;
    const avatarSrc = cover.avatarUrl || AVATAR_PLACEHOLDER;

    return (
      <div
        ref={ref}
        data-testid="cover-canvas"
        style={{
          width: 1920,
          height: 1080,
          position: "relative",
          background: `linear-gradient(170deg, ${C.bg2} 0%, ${C.bg1} 55%, #0A0E1A 100%)`,
          fontFamily:
            '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
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
            backgroundSize: "120px 120px",
            pointerEvents: "none",
          }}
        />

        {/* Center radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 70% 80% at 50% 50%, ${C.bg2}F0 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />

        {/* Ghost terminal window (top-left) */}
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 80,
            width: 340,
            height: 220,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.02)",
            background: "rgba(255,255,255,0.008)",
            pointerEvents: "none",
          }}
        >
          <div style={{ height: 28, borderBottom: "1px solid rgba(255,255,255,0.015)", display: "flex", alignItems: "center", padding: "0 12px", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          </div>
          {[80, 55, 70, 40, 65].map((w, i) => (
            <div key={i} style={{ margin: "10px 16px 0", height: 3, width: `${w}%`, background: "rgba(255,255,255,0.015)", borderRadius: 2 }} />
          ))}
        </div>

        {/* Ghost chat panel (top-right) */}
        <div
          style={{
            position: "absolute",
            top: 160,
            right: 100,
            width: 300,
            height: 200,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.02)",
            background: "rgba(255,255,255,0.006)",
            pointerEvents: "none",
          }}
        >
          {[60, 45, 75, 50].map((w, i) => (
            <div
              key={i}
              style={{
                margin: `${i === 0 ? 16 : 12}px ${i % 2 === 0 ? "auto" : "16px"} 0 ${i % 2 === 0 ? "16px" : "auto"}`,
                height: 14,
                width: `${w}%`,
                background: "rgba(255,255,255,0.012)",
                borderRadius: 7,
              }}
            />
          ))}
        </div>

        {/* Ghost commit graph (bottom-left) */}
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 140,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            pointerEvents: "none",
          }}
        >
          {[180, 140, 200, 120, 160].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: i === 0 ? `${C.accent}12` : "rgba(255,255,255,0.025)", flexShrink: 0 }} />
              <div style={{ height: 2, width: w, background: "rgba(255,255,255,0.015)", borderRadius: 1 }} />
            </div>
          ))}
        </div>

        {/* Ghost workflow cards (bottom-right) */}
        <div
          style={{
            position: "absolute",
            bottom: 120,
            right: 120,
            display: "flex",
            gap: 12,
            pointerEvents: "none",
          }}
        >
          {[{ w: 120, h: 80 }, { w: 100, h: 80 }, { w: 110, h: 80 }].map((card, i) => (
            <div
              key={i}
              style={{
                width: card.w,
                height: card.h,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.018)",
                background: "rgba(255,255,255,0.006)",
              }}
            />
          ))}
        </div>

        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent 20%, ${C.accent}20 50%, transparent 80%)`,
          }}
        />

        {/* Subtle warm accent glow (very faint) */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 300,
            background: `radial-gradient(ellipse at center, ${C.accent}06 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* ── Content ───────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* macOS-style toolbar — Claude × Codex */}
          <div
            style={{
              position: "absolute",
              top: 48,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "6px 20px",
            }}
          >
            <img src="/icons/claude.svg" alt="Claude" style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.5 }} />
            <span style={{ fontSize: 12, color: C.subtle, fontWeight: 400, letterSpacing: "0.04em" }}>
              {cover.badge1}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.12)" }}>×</span>
            <img src="/icons/codex.svg" alt="Codex" style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.5 }} />
            <span style={{ fontSize: 12, color: C.subtle, fontWeight: 400, letterSpacing: "0.04em" }}>
              {cover.badge2}
            </span>
          </div>

          {/* Avatar */}
          {cover.avatarVisible && (
            <div style={{ position: "relative", flexShrink: 0, marginBottom: 44 }}>
              <div
                style={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.06)",
                  zIndex: 0,
                }}
              />
              <img
                src={avatarSrc}
                alt="Avatar"
                style={{
                  position: "relative",
                  zIndex: 1,
                  width: 320,
                  height: 320,
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
                  width: 200,
                  height: 60,
                  background: "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.04), transparent 80%)",
                  borderRadius: "50%",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            </div>
          )}

          {/* Main title — editorial, light weight */}
          <h1
            style={{
              fontSize: 88,
              fontWeight: 500,
              color: C.text,
              letterSpacing: "0.02em",
              lineHeight: 1.1,
              margin: 0,
              textAlign: "center",
            }}
          >
            {cover.title}
          </h1>

          {/* Subtitle */}
          {cover.hookText && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: C.muted,
                letterSpacing: "0.06em",
                marginTop: 14,
                textAlign: "center",
              }}
            >
              {cover.hookText}
            </div>
          )}

          {/* TODAY'S BUILD card — glassmorphism */}
          <div
            style={{
              marginTop: 52,
              background: C.glass,
              border: `1px solid ${C.glassBorder}`,
              borderRadius: 14,
              padding: "24px 48px 28px",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              textAlign: "center",
              position: "relative",
              minWidth: 420,
            }}
          >
            {/* Tiny accent line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60,
                height: 1.5,
                background: `${C.accent}50`,
                borderRadius: 1,
              }}
            />
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: C.subtle,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {cover.todayLabel}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 500,
                color: C.text,
                lineHeight: 1.3,
                letterSpacing: "0.01em",
              }}
            >
              {cover.todayTopic}
            </div>
          </div>
        </div>

        {/* Bottom subtle accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.accent}25, transparent)`,
          }}
        />
      </div>
    );
  },
);

CoverCanvas.displayName = "CoverCanvas";
export default CoverCanvas;
