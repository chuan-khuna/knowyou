# Spec: Quiz reset returns to the settings

Status: done

Terms follow `GLOSSARY.md`. The quiz screen is in `docs/documents/quiz.md` ("Screens and sound", Reset bullet); the reset button is `src/components/reset-button.tsx`.

## Problem Statement

On a quiz, a confirmed เริ่มใหม่ starts a new play of the same count at question 1. A player who wants a different count, a seed code or the reveal switch has no way back to ตั้งค่า except finishing the play.

## Solution

A confirmed เริ่มใหม่ on the question or reveal screen of any quiz title returns to the intro, with ตั้งค่า showing what the player last chose.

## User Stories

1. As a player mid-quiz, I want เริ่มใหม่ to take me back to ตั้งค่า, so that I can pick another count before playing again.
2. As a player who typed a seed code, I want the code and count still filled in, so that I can replay the same quiz or change one thing.
3. As a player, I want a refresh after เริ่มใหม่ to show the intro, not the old play, so that the reset sticks.

## Implementation Decisions

- The reset clears the saved play and shows the intro. It does not start a play, so it makes no `start` sound.
- ตั้งค่า keeps its state: the picked button (20 ข้อ, 30 ข้อ or ขั้นสูง), the count field and the seed code field, as when the player left the intro.

## Assumptions

Taken without a grilling round; veto here.

- **Only the quizzes.** The guessing games' intro has no settings, so their reset keeps starting a new play.
- **เล่นอีกครั้ง is unchanged.** On the result it still starts a new play of the same count with a random seed.
- **The two-tap confirm stays.** The button still arms into เริ่มใหม่? first.

## Testing Decisions

Verify in the real app: start a quiz with ขั้นสูง and a code, answer one question, confirm เริ่มใหม่, see the intro with the same count and code, refresh and still see the intro. `bun test`, `bun run typecheck`, `bun run build`.

## Out of Scope

The games' reset; เล่นอีกครั้ง; the reset button's look.

## Comments
- 2026-11-27: shipped in PR #3 (merge 7af9c1f).
