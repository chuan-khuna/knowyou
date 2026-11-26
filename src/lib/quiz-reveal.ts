/**
 * Whether a quiz shows each answer right away: the เฉลยทุกข้อ switch. One
 * choice for every quiz title, kept in localStorage like the sound switch.
 * Off by default, so a play holds its answers until the result.
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "knowyou:quiz-reveal";

/** The choice for this page when localStorage is blocked. */
let fallbackOn = false;
const listeners = new Set<() => void>();

function readOn(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return fallbackOn;
  }
}

export function setRevealOn(on: boolean): void {
  fallbackOn = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Without storage the choice lasts until the page closes.
  }
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

/** Whether each answer is shown right away. The server render assumes off; the client corrects it after hydration. */
export function useRevealOn(): boolean {
  return useSyncExternalStore(subscribe, readOn, () => false);
}
