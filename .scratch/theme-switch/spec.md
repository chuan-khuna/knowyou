# Theme switch

Status: ready-for-agent

## Problem Statement

The site follows the device's light or dark setting, and the player cannot change it. A player who wants the dark sheet on a light-mode phone, or the cream page at night on a dark-mode laptop, has no way to get it.

## Solution

The top strip gets a theme button beside the sound button, on the home page and on every play screen. One tap flips between light and dark. Before the first tap the page follows the device; after it, the choice is kept and survives a refresh.

## User Stories

1. As a player, I want a theme button next to the sound button, so that I find both page settings in one place.
2. As a player, I want one tap to flip light and dark, so that switching is quick.
3. As a player, I want the page to start on my device's setting, so that nothing changes until I ask.
4. As a player, I want my choice kept after a refresh, with no flash of the other theme while the page loads.
5. As a screen-reader user, I want the button to say what it does and whether dark mode is on.

## Implementation Decisions

- **Two states, light and dark** (decided in chat). No "auto" state: with nothing stored, the page follows the device and keeps following it if the device setting changes.
- **Colour tokens use `light-dark()`.** Each colour that changes in dark mode is one `light-dark(light, dark)` value in `tokens.css`, which replaces the `prefers-color-scheme` block. `:root` has `color-scheme: light dark`; `data-theme="light"` or `"dark"` on `<html>` pins it to one. Without a stored choice, or without JavaScript, the page follows the device.
- **No flash.** An inline script in `<head>` reads the stored choice and sets `data-theme` before the body paints. `<html>` carries `suppressHydrationWarning` for that attribute.
- **Store.** `src/lib/theme.ts` holds the key `knowyou:theme`, the read and write, and the subscription (the media query and other tabs), in the pattern of `src/lib/sound.ts`.
- **The button.** `ThemeToggle`, a 44px `icon-button` like `SoundToggle`. Its accessible name and `title` are โหมดมืด, and `aria-pressed` is true in dark mode. A moon icon in dark mode, a sun in light mode, in the style of Lucide's `moon` and `sun`. It sits immediately before the sound button.

## Assumptions

- The button plays no sound: switching the theme is not a game moment.
- The server render shows the sun; the client corrects the icon after hydration, as the sound button does.
- The docs pages under `docs/` keep following the device; this switch is for the app only.

## Testing Decisions

- No unit test: the store is a thin wrapper around localStorage and the DOM. Check in the browser: the toggle flips the page, survives a refresh with no flash, and the quiz top strip fits a phone as it did before (a 320px quiz strip already overflowed before this change).

## Out of Scope

- An "auto" state, other themes, or a setting in a menu.

## Comments

- Narrow strip (asked in chat during the build): on a quiz question or reveal screen the strip already holds the progress chip and the reveal, reset and sound buttons, and the theme button pushed the sound button off phones under ~425px. `Shell` takes `crowded`, which the quiz passes on those screens, and hides the theme button below `sm`. See `docs/documents/theme.md`.
