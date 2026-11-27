/**
 * How a drawn switch's knob moves when it flips, shared by the theme switch
 * and `AnimeSwitch`: it crouches against its start, smears across the track,
 * slams into the far end squashed, and springs back to round. Keyframes for
 * Web Animations; `dir` is 1 moving right and -1 moving left.
 */

/** How far a knob travels, in px: a 52px track less its 2px line and 2px gaps, less the 22px knob. */
export const KNOB_TRAVEL = 22;
/** The crouch, the dash and the slam into the far end. */
export const DASH_MS = 210;
/** The squash at the end springing back to round. */
export const SETTLE_MS = 320;

/** The dash, relative to where the knob starts. */
export function dashFrames(dir: number): Keyframe[] {
  return [
    { transform: "translateX(0) scale(1, 1)" },
    { transform: `translateX(${-2 * dir}px) scale(0.82, 1.14)`, offset: 0.2, easing: "ease-in" },
    { transform: `translateX(${10 * dir}px) scale(1.75, 0.72)`, offset: 0.55 },
    { transform: `translateX(${20 * dir}px) scale(1.3, 0.86)`, offset: 0.85 },
    { transform: `translateX(${(KNOB_TRAVEL + 1) * dir}px) scale(0.72, 1.22)` },
  ];
}

/** From the slam, at the new end: the squash springs back with one overshoot. */
export function settleFrames(dir: number): Keyframe[] {
  return [
    { transform: `translateX(${dir}px) scale(0.72, 1.22)` },
    { transform: `translateX(${-dir}px) scale(1.1, 0.92)`, offset: 0.4 },
    { transform: "translateX(0) scale(0.97, 1.03)", offset: 0.7 },
    { transform: "translateX(0) scale(1, 1)" },
  ];
}

/**
 * The whole flip as one animation, relative to the knob's new end, for a
 * switch whose state (and so the knob's resting place) changes at once.
 */
export function flipFrames(dir: number): Keyframe[] {
  const split = DASH_MS / (DASH_MS + SETTLE_MS);
  const shift = (frame: Keyframe, offset: number): Keyframe => {
    const transform = String(frame.transform).replace(/translateX\((-?[\d.]+)px\)|translateX\(0\)/, (whole, x) => {
      const moved = (x === undefined ? 0 : Number(x)) - KNOB_TRAVEL * dir;
      return `translateX(${moved}px)`;
    });
    return { ...frame, transform, offset };
  };
  const dash = dashFrames(dir).map((frame, i, all) => shift(frame, (frame.offset ?? i / (all.length - 1)) * split));
  const settle = settleFrames(dir)
    .slice(1)
    .map((frame, i, all) => ({ ...frame, offset: split + (frame.offset ?? (i + 1) / all.length) * (1 - split) }));
  return [...dash, ...settle];
}
