"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { entranceSparkle, pressEffect, type WordId } from "@/lib/anime-fx";

export type AdTone = "clay" | "sea" | "moss" | "wheat" | "plum" | "slate";

interface MockAdProps {
  tone: AdTone;
  /**
   * Inline SVG drawn on a 48 by 48 grid in `currentColor`. `.spot` paths take a
   * pale fill; `.puff` paths rise in and `.twinkle` paths pop in on the entrance.
   */
  art: ReactNode;
  headline: string;
  copy: string;
  cta: string;
  /** The Thai sound word a press throws. */
  word: WordId;
}

/**
 * A mock ad for a made-up product, filling an ad slot exactly (100px, 120px
 * from `sm`). Nothing in it takes focus; the call to action is text, not a
 * link. The first time it scrolls into view it sets `data-motion="seen"`,
 * which plays the entrance in `surfaces.css` (`pending` hides it until then)
 * and throws one sparkle on the art tile. A press, released inside the ad,
 * throws an impact, a puff and `word` at the press point (`@/lib/anime-fx`).
 * See "Ad slot" in `docs/documents/quiz.md`.
 */
export function MockAd({ tone, art, headline, copy, cta, word }: MockAdProps) {
  const ref = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const pressed = useRef(false);

  useEffect(() => {
    const ad = ref.current;
    if (!ad) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          ad.dataset.motion = "seen";
          observer.disconnect();
          if (artRef.current) entranceSparkle(artRef.current);
        } else {
          ad.dataset.motion = "pending";
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(ad);
    return () => observer.disconnect();
  }, []);

  function release(event: PointerEvent<HTMLElement>) {
    if (!pressed.current) return;
    pressed.current = false;
    const box = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (inside) pressEffect(event.currentTarget, event.pageX, event.pageY, word);
  }

  return (
    <aside
      ref={ref}
      aria-label="โฆษณา"
      onPointerDown={() => (pressed.current = true)}
      onPointerUp={release}
      onPointerCancel={() => (pressed.current = false)}
      onPointerLeave={() => (pressed.current = false)}
      className={`mock-ad mock-ad--${tone} mt-10 flex h-[100px] items-center gap-3 pr-4 pl-3 sm:h-[120px] sm:gap-4 sm:pr-5 sm:pl-[14px]`}
    >
      <div ref={artRef} className="mock-ad-art grid size-[72px] flex-none place-items-center sm:size-[88px]" aria-hidden="true">
        <svg viewBox="0 0 48 48" className="size-12 sm:size-14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {art}
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="mock-ad-head truncate text-[1.0625rem] leading-snug sm:text-xl">{headline}</p>
        <p className="mt-0.5 truncate text-sm text-ink-2">{copy}</p>
      </div>
      <span className="mock-ad-cta hidden flex-none px-4 py-1.5 text-sm sm:block">{cta}</span>
      <span className="absolute top-1 right-3 font-mono text-[10px] leading-none text-muted" aria-hidden="true">
        ads
      </span>
    </aside>
  );
}
