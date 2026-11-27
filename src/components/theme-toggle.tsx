"use client";

import { useRef, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { toggleTheme, useTheme } from "@/lib/theme";

const REVEAL_MS = 500;
const SPIN_MS = 300;

/**
 * The top strip's light/dark switch, beside the sound button: a sun in light
 * mode, a moon in dark mode. The choice is kept in localStorage. `className` is
 * for hiding it on a crowded strip.
 *
 * A tap reveals the new theme as a circle growing from the button, through a
 * view transition, and spins the new icon in. With reduced motion, or without
 * view transitions, the theme changes at once.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useTheme() === "dark";
  const icon = useRef<SVGSVGElement>(null);

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      toggleTheme();
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => {
      flushSync(toggleTheme);
      icon.current?.animate([{ rotate: "-90deg", scale: 0.4 }, { rotate: "0deg", scale: 1 }], { duration: SPIN_MS, easing: "ease-out" });
    });
    transition.ready.then(
      () => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: REVEAL_MS, easing: "ease-out", pseudoElement: "::view-transition-new(root)" },
        );
      },
      () => {},
    );
  }

  return (
    <button type="button" className={className ? `icon-button ${className}` : "icon-button"} aria-label="โหมดมืด" aria-pressed={dark} title="โหมดมืด" onClick={onClick}>
      <svg ref={icon} aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dark ? (
          <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </>
        )}
      </svg>
    </button>
  );
}
