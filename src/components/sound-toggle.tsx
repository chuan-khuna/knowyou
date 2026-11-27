"use client";

import { soundEffect } from "@/lib/anime-fx";
import { setSoundOn, useSoundOn } from "@/lib/sound";

/**
 * The top strip's mute switch: a speaker icon when sound is on, a crossed
 * speaker when it is off. The choice is kept in localStorage. A tap plays a
 * small drawn flourish at the button (`soundEffect`).
 */
export function SoundToggle() {
  const on = useSoundOn();
  return (
    <button
      type="button"
      className="icon-button"
      aria-label="เสียง"
      aria-pressed={on}
      title="เสียง"
      onClick={(event) => {
        setSoundOn(!on);
        soundEffect(event.currentTarget, !on);
      }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z" />
        {on ? (
          <>
            <path d="M16 9a5 5 0 0 1 0 6" />
            <path d="M19.4 18.4a9 9 0 0 0 0-12.7" />
          </>
        ) : (
          <>
            <line x1="22" x2="16" y1="9" y2="15" />
            <line x1="16" x2="22" y1="9" y2="15" />
          </>
        )}
      </svg>
    </button>
  );
}
