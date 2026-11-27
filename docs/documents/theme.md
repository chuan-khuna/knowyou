# Theme switch

How the page picks light or dark, and the switch in the top strip. Code: `src/lib/theme.ts`, `src/lib/theme-script.ts`, `src/components/theme-toggle.tsx`, and the colour tokens in `src/styles/tokens.css`. Spec: `.scratch/theme-switch/spec.md`.

## How the colours follow the theme

- Each colour token that differs in dark mode is one `light-dark(light, dark)` value in `tokens.css`. There is no `prefers-color-scheme` block.
- `:root` has `color-scheme: light dark`, so with no choice stored the page follows the device, and keeps following it if the device setting changes.
- The switch stores a choice and sets `data-theme="light"` or `"dark"` on `<html>`. `:root[data-theme=…]` pins `color-scheme` to that one scheme.
- Lightning CSS, inside the Tailwind build, compiles `light-dark()` to `--lightningcss-light` and `--lightningcss-dark` fallbacks and sets them wherever `color-scheme` is set. The `data-theme` rules outrank the media-query rule it emits, so a stored choice wins over the device.

## No flash on load

The root layout puts `THEME_INIT_SCRIPT` in `<head>`. It reads `knowyou:theme` from localStorage and sets `data-theme` before the body paints. `<html>` has `suppressHydrationWarning`, because the attribute is not in the server render. The key and the script live in `theme-script.ts`, which has no React import, so the layout (a server component) can import it.

## The switch

- A 44px `icon-button` immediately before the sound button: a sun in light mode, a moon in dark mode, in the style of Lucide's `sun` and `moon`. Its accessible name and `title` are โหมดมืด, and `aria-pressed` is true in dark mode.
- One tap flips light and dark. There is no "auto" state; before the first tap the button shows the device's scheme.
- A tap reveals the new theme as a circle that grows from the button's centre until it reaches the farthest corner of the window, in 500 ms, ease-out. The switch wraps the change in `document.startViewTransition` and, once the transition is ready, animates `clip-path` on `::view-transition-new(root)`. `base.css` turns off the default cross-fade on the root snapshots, so the old theme stays still beneath the circle.
- The change runs inside `flushSync`, so the new icon is already in the new snapshot. The new sun or moon turns in from -90° and 40% scale in 300 ms.
- When the reveal ends (`transition.finished`), a small drawn effect plays at the button (`themeEffect`, `drawn-effects.md`): three sparkles on the way to dark, a small sun flare on the way to light. It waits because the live page, and the effects canvas with it, is hidden under the transition's snapshots until then. Its colours are read from the new theme. Without view transitions (and motion allowed) it plays at once.
- With `prefers-reduced-motion: reduce`, or in a browser without `startViewTransition`, the theme changes at once and the icon does not turn. A change from another tab or from the device's scheme also applies at once.
- Chrome sends pointer events to `<html>` while a view transition runs, so taps during the 500 ms reveal are dropped. The icon always matches `data-theme`.
- `toggleTheme()` in `theme.ts` reads the theme when it runs, not at the last render, so a tap never flips from a stale value.
- The choice is stored under `knowyou:theme`, survives a refresh, and follows other open tabs through the `storage` event. With localStorage blocked it lasts until the page closes.
- It makes no sound.
- The server render shows the sun; the client corrects the icon after hydration, as the sound button does.

## Where it shows

On the home page, beside the sound button, and in `Shell`'s top strip on every game and quiz screen. `Shell` takes `crowded`: the quiz question and reveal screens pass it, which hides the switch below `sm` (640px). Those strips already hold the progress chip and the reveal, reset and sound buttons, and a fifth button pushed the sound button off a phone screen. The switch stays on the quiz intro and result, on the guessing games, and from `sm` up.
