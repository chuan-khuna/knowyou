# Spec: Mock ads

Status: ready-for-agent

Terms follow `GLOSSARY.md`. Builds on `.scratch/ad-slot/spec.md`: the ad slots and their spots. The look takes its cue from the Sakuga VFX gallery (`https://sakuga-vfx.vercel.app/gallery/`), muted.

## Problem Statement

The ad slots are empty dashed frames. They show where an ad goes, not how a real ad will sit on the page, so it is hard to judge whether an ad there is too loud or fits.

## Solution

A small set of mock ads for made-up products, each its own component named `Ads<Slug>`, such as `<AdsRamen />`. Each fills an ad slot exactly. The spots show a mix of them, so the page can be judged with ads in place.

## User Stories

1. As the site owner, I want to see believable ads in each spot, so that I can judge which spots to keep.
2. As the site owner, I want to drop an ad in by name, `<AdsRamen />`, so that trying another ad in a spot is a one-word change.
3. As a player, I want an ad marked as one, so that I never mistake it for part of the quiz.
4. As a player, I want ads that match the page's calm colours in light and dark, so that they don't shout over the questions.
5. As a keyboard player, I want ads out of the tab order, so that 1 to 4 and Enter work as before.

## Implementation Decisions

- **Style: muted neo-brutal.** From the reference, it keeps a solid ink border (about 2 px), a hard offset shadow with no blur (about 4–5 px, in a muted tint), a 15 px radius, italic extra-bold headlines, and one flat accent colour per ad. Muted means it uses the site's ink and low-chroma `oklch()` tints, written with `light-dark()` so dark mode works, and no saturated pink or lavender.
- **Motion, in the reference's spirit, held back.** Springs, squash and overshoot, but only when the player is already looking:
  - **Entrance.** The first time a mock scrolls into view it pops in once: it rises a few px with a small overshoot, and its hard shadow lands a beat after (about 400 ms).
  - **Hover and press.** On pointer hover the card lifts toward its shadow; on press it squashes into the shadow and springs back. It is still not a link and still not focusable.
  - **Art.** The art tile may move once on entrance (a bounce, a steam puff, a sparkle), never in a loop.
  - **Never.** No loops and no idle motion. With `prefers-reduced-motion: reduce`, none of it runs.
- **Shape.** Each mock is a banner at the slot's fixed height (about 100 px on a phone, 120 px from `sm` up): a square art tile drawn with inline SVG or CSS, a headline and one line of Thai copy, and a call-to-action pill on the right from `sm` up. A small `ads` tag in a corner marks it.
- **Not interactive.** A mock is an `<aside aria-label="โฆษณา">` with nothing focusable or clickable; the call-to-action is text styled as a pill, not a link.
- **Feels like an ad under the pointer.** Its text can't be selected (`user-select: none`), and the pointer is a hand over the whole mock.
- **Made-up products only.** No real brand, shop, product or person. The products suit anime fans: a ramen shop, a manga shop, a figure pre-order, a café, and similar.
- **Placement.** Each spot from the ad-slot prototype shows one mock, a different one per spot where it can. `AdSlot`, the dashed `ads` frame, stays as the empty fallback.

## Assumptions

Taken without a grilling round; veto here.

- **Five or six mocks**, Thai copy, one component file each under one folder, plus an index that exports them all.
- **The `ads` tag** stays on every mock.

## Testing Decisions

Verify in the real app: every spot shows a mock that fills its slot without moving the page, in light and dark, at 390 and 1280 px; Tab never lands inside a mock; no console errors. `bun test`, `bun run typecheck`, `bun run build`.

## Out of Scope

A real ad network, rotation, tracking, consent.
