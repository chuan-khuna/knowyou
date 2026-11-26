"use client";

import { useEffect, useState } from "react";

const ARMED_MS = 3000;

/**
 * The top strip's start-over switch. The first tap arms it into เริ่มใหม่?; a
 * second tap within 3 seconds calls `onReset`. The timer or Escape disarms it.
 * Both states are one `<button>`, so focus stays on it and a keyboard user
 * confirms with a second Enter or Space.
 */
export function ResetButton({ onReset }: { onReset: () => void }) {
  const [state, setState] = useState<"idle" | "armed">("idle");

  useEffect(() => {
    if (state !== "armed") return;
    const timer = setTimeout(() => setState("idle"), ARMED_MS);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setState("idle");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [state]);

  const onClick = () => {
    if (state === "idle") return setState("armed");
    setState("idle");
    onReset();
  };

  return (
    <button
      type="button"
      className={state === "armed" ? "icon-button icon-button--armed" : "icon-button"}
      aria-label={state === "armed" ? undefined : "เริ่มใหม่"}
      title="เริ่มใหม่"
      onClick={onClick}
    >
      {state === "armed" ? (
        "เริ่มใหม่?"
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      )}
    </button>
  );
}
