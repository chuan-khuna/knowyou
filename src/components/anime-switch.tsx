"use client";

import { useRef } from "react";
import { dashEffect, switchEffect } from "@/lib/anime-fx";
import { DASH_MS, flipFrames, SETTLE_MS } from "@/lib/anime-fx/knob";

/**
 * A drawn on/off switch: a real `<input type="checkbox" role="switch">`,
 * transparent, over a track and a knob (`.switch` in controls.css). Put it in
 * a `<label>` with its text, as `.toggle-row` does.
 *
 * The state changes at once. A flip by the player then plays the knob's dash,
 * slam and settle from where it was (`flipFrames`), with speed lines, and the
 * slam throws its effect (`switchEffect`): turning on, a small impact, wedges
 * and ติ๊ง!; turning off, one small puff. With reduced motion nothing moves.
 */
export function AnimeSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const knob = useRef<HTMLSpanElement>(null);

  return (
    <span className="switch">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => {
          const on = event.target.checked;
          onChange(on);
          const el = knob.current;
          if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          const dir = on ? 1 : -1;
          el.animate(flipFrames(dir), { duration: DASH_MS + SETTLE_MS });
          dashEffect(el, dir);
          setTimeout(() => switchEffect(el, on), DASH_MS);
        }}
      />
      <span className="switch-track" aria-hidden="true">
        <span ref={knob} className="switch-knob">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </span>
      </span>
    </span>
  );
}
