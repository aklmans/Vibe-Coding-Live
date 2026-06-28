"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { SurfaceCard } from "./content";

interface SurfacesTabsProps {
  cards: ReadonlyArray<SurfaceCard>;
}

/**
 * Accessible tabs for the Surfaces section. Uses the WAI-ARIA tabs pattern:
 * - container has role="tablist"
 * - each tab is a button with role="tab", aria-selected, aria-controls
 * - each panel has role="tabpanel", aria-labelledby
 * - Left/Right arrows move focus and activate (automatic activation)
 * - Home/End jump to first/last tab
 * - Focus ring uses the warm accent color
 *
 * Only this component is a client component; the rest of the landing page
 * stays server-rendered.
 */
export default function SurfacesTabs({ cards }: SurfacesTabsProps) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const focusTab = useCallback((index: number) => {
    const clamped = ((index % cards.length) + cards.length) % cards.length;
    setSelected(clamped);
    tabRefs.current[clamped]?.focus();
  }, [cards.length]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          focusTab(selected + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          focusTab(selected - 1);
          break;
        case "Home":
          event.preventDefault();
          focusTab(0);
          break;
        case "End":
          event.preventDefault();
          focusTab(cards.length - 1);
          break;
      }
    },
    [selected, focusTab, cards.length],
  );

  // Keep tabRefs array length in sync if cards change (static in practice).
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, cards.length);
  }, [cards.length]);

  return (
    <>
      <div className="akl-surface-tablist" role="tablist" aria-label="Broadcast surface examples">
        {cards.map((card, index) => {
          const tabId = `${baseId}-tab-${card.id}`;
          const panelId = `${baseId}-panel-${card.id}`;
          const isSelected = index === selected;
          return (
            <button
              key={card.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              className="akl-surface-tab"
              data-selected={isSelected || undefined}
              onClick={() => setSelected(index)}
              onKeyDown={onKeyDown}
            >
              {card.title}
            </button>
          );
        })}
      </div>
      <div className="akl-surface-stage">
        {cards.map((card, index) => {
          const tabId = `${baseId}-tab-${card.id}`;
          const panelId = `${baseId}-panel-${card.id}`;
          const isSelected = index === selected;
          return (
            <article
              key={card.id}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!isSelected}
              className={`akl-surface-panel akl-surface-panel-${card.id} akl-surface-kind-${card.kind}`}
              data-surface-kind={card.kind}
            >
              <div className="akl-surface-preview">
                <img
                  src={card.src}
                  alt={card.alt}
                  width={card.width}
                  height={card.height}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="akl-surface-copy">
                <p className="akl-eyebrow">Export surface</p>
                <h3>{card.title}</h3>
                <p>{card.summary}</p>
                <ul>
                  {card.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
