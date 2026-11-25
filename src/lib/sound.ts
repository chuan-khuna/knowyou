/**
 * UI sounds, from uisfx (MIT code, CC0 audio). Sound only reinforces what the
 * screen already shows, so every moment here has visible feedback too.
 *
 * Components call the semantic helpers on `sound`; the cue names live only in
 * MOMENT_CUES. The player and its AudioContext are created on the first
 * sound, which always comes from a click or key press, so nothing plays
 * before a user gesture.
 */

import { useSyncExternalStore } from "react";
import { createUISFX, type CueName, type UISFXPlayer } from "uisfx";

const MOMENT_CUES = {
  start: "start",
  answer: "select",
  guess: "complete",
  right: "success",
  wrong: "info",
  step: "progress-step",
  openGame: "open",
  pickProvince: "select",
} as const satisfies Record<string, CueName>;

export type SoundMoment = keyof typeof MOMENT_CUES;

const PACK = "soft";
const VOLUME = 0.5;
const STORAGE_KEY = "knowyou:sound";

let player: UISFXPlayer | null = null;
/** The choice for this page when localStorage is blocked. */
let fallbackOn = true;
const listeners = new Set<() => void>();

function readOn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return fallbackOn;
  }
}

function play(moment: SoundMoment): void {
  if (typeof window === "undefined" || !readOn()) return;
  const current = (player ??= createUISFX({ pack: PACK, volume: VOLUME }));
  void current.unlock().then((ready) => {
    if (ready) current.play(MOMENT_CUES[moment]);
  });
}

export const sound = Object.fromEntries(
  (Object.keys(MOMENT_CUES) as SoundMoment[]).map((moment) => [moment, () => play(moment)]),
) as Record<SoundMoment, () => void>;

export function setSoundOn(on: boolean): void {
  fallbackOn = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Without storage the choice lasts until the page closes.
  }
  if (!on) player?.stopAll();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Whether sound is on. The server render assumes on; the client corrects it after hydration. */
export function useSoundOn(): boolean {
  return useSyncExternalStore(subscribe, readOn, () => true);
}
