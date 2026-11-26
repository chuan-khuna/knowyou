# Spec: Reset button in the top bar

Status: ready-for-agent

Terms follow `GLOSSARY.md`. The shared play screen is described in `docs/documents/play-screen.md`.

## Problem Statement

A player halfway through a play who wants to start over has no way to do it. A refresh restores the saved play, and the home page link leads back to the same saved play. They have to finish the play, or answer at random to reach the result and its เล่นอีกครั้ง.

## Solution

A reset icon in the top bar, beside the sound icon, on every screen where a play is in progress: Anime Age, Province, University and the Prince of Tennis quiz. The first tap turns it into a small "เริ่มใหม่?" button. A second tap within 3 seconds throws away the play and starts a fresh one at question 1. Without the second tap it turns back into the icon.

## User Stories

1. As a player in the middle of a play, I want a reset icon in the top bar, so that I can start over without finishing.
2. As a player, I want the first tap to ask "เริ่มใหม่?" instead of resetting at once, so that a slip next to the sound icon doesn't lose my answers.
3. As a player who tapped by mistake, I want the confirm to go away on its own after 3 seconds, or when I press Escape, so that I can carry on.
4. As a player who confirms, I want a fresh play at question 1 with new questions, so that it feels like a real new start.
5. As a Prince of Tennis player, I want a reset to keep the mode I was playing (20 questions or all of them), so that I don't have to choose again.
6. As a player who resets, I want the saved play cleared, so that a refresh doesn't bring the old play back.
7. As a keyboard or screen reader user, I want the icon to be a real button named "เริ่มใหม่" with a visible focus ring, so that I can find and use it.

## Implementation Decisions

- **One component owns the confirm.** A reset button component holds a two-state machine, idle and armed. A tap while idle arms it. A tap while armed calls the reset. Arming starts a 3-second timer back to idle, and Escape also disarms it.
- **The top bar renders it.** The shared top bar gains one optional reset callback. When it's given, the reset button sits before the sound toggle. A screen with no play in progress passes nothing, so the intro and result screens are unchanged.
- **Each screen passes its own fresh start.** The shared play screen passes the start it already uses for เริ่มเลย and เล่นอีกครั้ง. The Prince of Tennis quiz passes a start in the current mode, on the question screen and on the screen that shows whether an answer was right. Both already clear the saved play and play the start sound.
- **Looks.** Idle is an icon button in the sound toggle's style: a counter-clockwise arrow, inline SVG, `aria-label` and `title` "เริ่มใหม่". Armed is a small text button "เริ่มใหม่?" in the accent, the same height, so the bar doesn't jump. Hallmark tokens and classes, no emoji.

## Testing Decisions

- The component has no logic beyond the two states and the timer, and the repo has no component tests. Verify it in the browser: arm, wait 3 seconds, arm, press Escape, arm and confirm. Check that the question number goes back to 1, that a refresh straight after shows the intro rather than the old play (a play with no answers isn't saved), and that the Prince of Tennis quiz keeps its mode.
- `bun test`, `bun run typecheck` and `bun run build` stay green.

## Out of Scope

- A keyboard shortcut. Number keys answer questions, and a reset key is easy to hit by mistake.
- A reset on the intro or the result screen. The result already has เล่นอีกครั้ง.
- The back button (`.scratch/anime-age/issues/01-back-button.md`).

## Assumptions

Taken without asking, per the requirements gate. Veto any of them here.

- The icon shows from question 1. A reset there just draws new questions.
- A fresh play skips the intro and goes straight to question 1.
- Answering a question while the button is armed leaves it armed until its timer runs out.
