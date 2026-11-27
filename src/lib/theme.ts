/**
 * Light or dark page. With nothing stored the page follows the device through
 * `color-scheme: light dark`; the theme switch stores a choice and pins it with
 * `data-theme` on <html>, which the colour tokens' `light-dark()` values follow.
 */

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

export type Theme = "light" | "dark";

const STORAGE_KEY = THEME_STORAGE_KEY;
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** The choice for this page when localStorage is blocked. */
let fallback: Theme | null = null;
const listeners = new Set<() => void>();

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return fallback;
  }
}

function readTheme(): Theme {
  return readStored() ?? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");
}

function apply(theme: Theme | null): void {
  if (theme) document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
}

export function setTheme(theme: Theme): void {
  fallback = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Without storage the choice lasts until the page closes.
  }
  apply(theme);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const media = window.matchMedia(DARK_QUERY);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    apply(readStored());
    listener();
  };
  media.addEventListener("change", listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The page's theme. The server render assumes light; the client corrects it after hydration. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "light");
}
