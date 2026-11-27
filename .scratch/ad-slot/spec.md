# Spec: Ad slot placeholder

Status: done

Terms follow `GLOSSARY.md`. The quiz screens are in `docs/documents/quiz.md` ("Screens and sound"); the shared look is in `docs/documents/styles.md`.

## Problem Statement

The site may carry ads later. Today there is no place for one, so adding an ad would push the quiz around and could look loud next to the calm question cards.

## Solution

A quiet placeholder below the options on the quiz question and reveal screens. It reserves the space an ad will take and reads as part of the page, so a player barely notices it.

## User Stories

1. As a player, I want the ad space to sit below the answers, so that it never comes between me and the options.
2. As a player, I want it to be marked โฆษณา in small muted text, so that I know it is not part of the quiz.
3. As a player, I want it to look like the page around it in light and dark, so that it doesn't pull my eye.
4. As a player, I want the page not to jump when an ad loads later, so that I never tap the wrong option.
5. As a keyboard player, I want it out of the tab order, so that 1 to 4 and Enter work as before.

## Implementation Decisions

- **One component**, `AdSlot`, with no props. It is a box of fixed height across the content width: a faint paper fill, a hairline border in the page's line colour, the card radius, and a small muted โฆษณา label. No shadow, no motion, no colour that the page doesn't already use. Colours in `oklch()` or existing tokens.
- **Fixed height** so a future ad fills it without moving the page. About 100 px on a phone and 120 px from `sm` up, in line with common banner sizes.
- **Where.** Last on the quiz question screen, below the options and the keyboard hint, and last on the reveal screen, below ข้อต่อไป. It never sits between the player and an option or the next button. The reveal's verdict line already pushes the options down about 60 px; the slot neither causes nor fixes that.
- **Accessibility.** An `aside` labelled โฆษณา; nothing in it can take focus.

## Assumptions

Taken without a grilling round; veto here.

- **Only the quiz question and reveal screens.** Not the quiz intro or result, the home page, or the guessing games.
- **A placeholder only.** No ad network, script or tracking; that is a later decision.
- **Shown always**, with no switch to hide it.

## Testing Decisions

Verify in the real app: the slot shows below the options on a question and on a reveal, in light and dark, at a phone and a desktop width; Tab never lands in it. `bun test`, `bun run typecheck`, `bun run build`.

## Out of Scope

Real ads, consent banners, other pages.

## Comments
- 2026-11-27: the slots shipped in PR #4 (merge 8088ed9), showing the mock ads.
