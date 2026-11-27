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

- It is a `role="switch"` button, 58 by 44px, immediately before the sound button. Its accessible name and `title` are โหมดมืด, and `aria-checked` is true in dark mode. Inside it is a 52 by 30px track with a 2px line: a sky by day and a night by night. The 22px knob on it is itself the sun or the moon, drawn like the effects in a light tone, a shadow tone and a line. The sun is a butter disc with eight short rays, and the moon is a cream full moon with three craters. The knob sits left in light mode and right in dark mode. Styles: `.theme-switch` in `controls.css`.
- One tap flips light and dark. There is no "auto" state; before the first tap the switch shows the device's scheme.
- A flip is drawn like an anime cut, after Sakuga VFX's toggle. Upstream's toggle is painted frames that cannot be recoloured, so this one is drawn in code:
  1. **Crouch and dash (210 ms).** The knob squashes against its start, then smears across the track, stretched to 1.75 times its width. Speed lines streak out behind it (`dashEffect`, `drawn-effects.md`).
  2. **Slam.** The knob hits the far end squashed, and the theme changes. The new theme shows as a circle that grows from the knob until it reaches the farthest corner of the window, in 500 ms, ease-out. The switch wraps the change in `document.startViewTransition`, inside `flushSync`, and animates `clip-path` on `::view-transition-new(root)` once the transition is ready. `base.css` turns off the default cross-fade on the root snapshots, so the old theme stays still beneath the circle.
  3. **Impact and settle (320 ms).** The new page is live under its snapshot, so these show inside the circle as it grows. A small burst goes off at the end the knob hit, and wedges fly off it (`slamEffect`). To light, a ring of rays flares like the sun; to dark, three stars open. The knob springs back to round with one overshoot, and the new sun or moon turns in from -90° (from 90° on the way to light) and 40% scale in 300 ms.
- The dash and settle are Web Animations on the knob, and the effects are drawn on the page canvas. The effects' colours are read from the knob, so the slam draws in the new theme.
- A tap while a flip runs is ignored. Chrome also sends pointer events to `<html>` while a view transition runs, so taps during the reveal are dropped. The icon always matches `data-theme`.
- With `prefers-reduced-motion: reduce`, the theme changes at once, with no dash and no effects. In a browser without `startViewTransition`, the knob still dashes, and the theme changes all at once at the slam. A change from another tab or from the device's scheme applies at once.
- `toggleTheme()` in `theme.ts` reads the theme when it runs, not at the last render, so a tap never flips from a stale value.
- The choice is stored under `knowyou:theme`, survives a refresh, and follows other open tabs through the `storage` event. With localStorage blocked it lasts until the page closes.
- It makes no sound.
- The server render shows the sun on the left; the client corrects the switch after hydration, as the sound button does.

## Where it shows

On the home page, beside the sound button, and in `Shell`'s top strip on every game and quiz screen. `Shell` takes `crowded`: the quiz question and reveal screens pass it, which hides the switch below `sm` (640px). Those strips already hold the progress chip and the reveal, reset and sound buttons, and a fifth button pushed the sound button off a phone screen. The switch stays on the quiz intro and result, on the guessing games, and from `sm` up.
