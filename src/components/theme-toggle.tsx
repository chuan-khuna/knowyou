"use client";

import { useId, useRef } from "react";
import { flushSync } from "react-dom";
import { dashEffect, slamEffect } from "@/lib/anime-fx";
import { toggleTheme, useTheme } from "@/lib/theme";

/** How far the knob travels, in px: the track's inside width less the knob. Matches `.theme-switch` in controls.css. */
const TRAVEL = 22;
/** The crouch, the dash and the slam into the far end. */
const DASH_MS = 210;
/** The squash at the end springing back to round. */
const SETTLE_MS = 320;
const REVEAL_MS = 500;
const SPIN_MS = 300;

/** The knob's dash, relative to where it starts, moving `dir` (1 right, -1 left): crouch, smear, slam. */
function dashFrames(dir: number): Keyframe[] {
  return [
    { transform: "translateX(0) scale(1, 1)" },
    { transform: `translateX(${-2 * dir}px) scale(0.82, 1.14)`, offset: 0.2, easing: "ease-in" },
    { transform: `translateX(${10 * dir}px) scale(1.75, 0.72)`, offset: 0.55 },
    { transform: `translateX(${20 * dir}px) scale(1.3, 0.86)`, offset: 0.85 },
    { transform: `translateX(${(TRAVEL + 1) * dir}px) scale(0.72, 1.22)` },
  ];
}

/** From the slam, at its new end: the squash springs back with one overshoot. */
function settleFrames(dir: number): Keyframe[] {
  return [
    { transform: `translateX(${dir}px) scale(0.72, 1.22)` },
    { transform: `translateX(${-dir}px) scale(1.1, 0.92)`, offset: 0.4 },
    { transform: "translateX(0) scale(0.97, 1.03)", offset: 0.7 },
    { transform: "translateX(0) scale(1, 1)" },
  ];
}

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

/** The knob by day: a disc in two tones with a line, and eight short rays around it. */
function Sun() {
  const clip = useId();
  return (
    <g className="theme-switch-sun">
      <g className="theme-switch-rays">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return <line key={i} x1={12 + Math.cos(a) * 9} y1={12 + Math.sin(a) * 9} x2={12 + Math.cos(a) * 11.2} y2={12 + Math.sin(a) * 11.2} />;
        })}
      </g>
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

