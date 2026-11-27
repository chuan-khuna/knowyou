"use client";

import { useId, useRef } from "react";
import { flushSync } from "react-dom";
import { dashEffect, slamEffect } from "@/lib/anime-fx";
import { DASH_MS, dashFrames, SETTLE_MS, settleFrames } from "@/lib/anime-fx/knob";
import { toggleTheme, useTheme } from "@/lib/theme";

const REVEAL_MS = 500;
const SPIN_MS = 300;

/**
 * The top strip's light/dark switch: a track with a knob that carries the sun
 * in light mode and the moon in dark mode. The choice is kept in localStorage.
 * `className` is for hiding it on a crowded strip.
 *
 * A flip is drawn like an anime cut: the knob crouches, dashes across
 * stretched with speed lines behind it, and slams into the far end. At the
 * slam the theme changes, revealed as a circle growing from the knob through a
 * view transition, and the impact (`slamEffect`) goes off at the knob while
 * the squash springs back. With reduced motion the theme changes at once.
 * Without view transitions the knob still dashes and the theme changes at the
 * slam, all at once.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useTheme() === "dark";
  const knob = useRef<HTMLSpanElement>(null);
  const icon = useRef<SVGSVGElement>(null);
  const busy = useRef(false);

  function onClick() {
    const el = knob.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      toggleTheme();
      return;
    }
    if (busy.current) return;
    busy.current = true;
    const toDark = !dark;
    const dir = toDark ? 1 : -1;
    const dash = el.animate(dashFrames(dir), { duration: DASH_MS, fill: "forwards" });
    dashEffect(el, dir);

    dash.finished.then(
      () => {
        const box = el.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        const flip = () => {
          flushSync(toggleTheme);
          dash.cancel();
        };
        const land = () => {
          el.animate(settleFrames(dir), { duration: SETTLE_MS, easing: "ease-out" });
          icon.current?.animate([{ rotate: `${-90 * dir}deg`, scale: 0.4 }, { rotate: "0deg", scale: 1 }], { duration: SPIN_MS, easing: "ease-out" });
          slamEffect(el, toDark);
          busy.current = false;
        };
        if (!document.startViewTransition) {
          flip();
          land();
          return;
        }
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        const transition = document.startViewTransition(flip);
        transition.ready.then(
          () => {
            // The new page is live under its snapshot, so the settle and the impact show inside the circle as it grows.
            document.documentElement.animate(
              { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
              { duration: REVEAL_MS, easing: "ease-out", pseudoElement: "::view-transition-new(root)" },
            );
            land();
          },
          () => {
            busy.current = false;
          },
        );
      },
      () => {
        busy.current = false;
      },
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="โหมดมืด"
      title="โหมดมืด"
      className={className ? `theme-switch ${className}` : "theme-switch"}
      onClick={onClick}
    >
      <span className="theme-switch-track" aria-hidden="true">
        <span ref={knob} className="theme-switch-knob">
          <svg ref={icon} viewBox="0 0 24 24" width="22" height="22">
            {dark ? <Moon /> : <Sun />}
          </svg>
        </span>
      </span>
    </button>
  );
}

/** Ten points of a star around the sun's disc, as one path: tips at radius 11.4, notches at 7.4. */
const SUN_POINTS = (() => {
  const points = 10;
  const corners = Array.from({ length: points * 2 }, (_, i) => {
    const a = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 ? 7.4 : 11.4;
    return `${(12 + Math.cos(a) * r).toFixed(2)} ${(12 + Math.sin(a) * r).toFixed(2)}`;
  });
  return `M${corners.join("L")}Z`;
})();

/** The knob by day: a disc in two tones with a line, inside a ring of sharp points. */
function Sun() {
  const clip = useId();
  return (
    <g className="theme-switch-sun">
      <path className="theme-switch-points" d={SUN_POINTS} />
      <clipPath id={clip}>
        <circle cx="12" cy="12" r="6.6" />
      </clipPath>
      <circle className="theme-switch-shade" cx="12" cy="12" r="6.6" />
      <circle className="theme-switch-light" cx="10.9" cy="10.7" r="5.9" clipPath={`url(#${clip})`} />
      <circle className="theme-switch-line" cx="12" cy="12" r="6.6" />
    </g>
  );
}

/** The knob by night: a full moon in two tones with a line, and three craters. */
function Moon() {
  const clip = useId();
  return (
    <g className="theme-switch-moon">
      <clipPath id={clip}>
        <circle cx="12" cy="12" r="10" />
      </clipPath>
      <circle className="theme-switch-shade" cx="12" cy="12" r="10" />
      <circle className="theme-switch-light" cx="10.4" cy="10.2" r="9.2" clipPath={`url(#${clip})`} />
      <circle className="theme-switch-crater" cx="8.6" cy="9.4" r="2.4" />
      <circle className="theme-switch-crater" cx="14.6" cy="14.2" r="1.7" />
      <circle className="theme-switch-crater" cx="13.4" cy="7.4" r="1.1" />
      <circle className="theme-switch-line" cx="12" cy="12" r="10" />
    </g>
  );
}

