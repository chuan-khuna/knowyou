"use client";

import { setSoundOn, useSoundOn } from "@/lib/sound";

/** The top strip's mute switch. The choice is kept in localStorage. */
export function SoundToggle() {
  const on = useSoundOn();
  return (
    <button type="button" className="toggle" aria-pressed={on} aria-label="เสียง" onClick={() => setSoundOn(!on)}>
      <span aria-hidden="true" className="toggle-dot" />
      เสียง {on ? "เปิด" : "ปิด"}
    </button>
  );
}
