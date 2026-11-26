# Quiz seed code

Status: ready-for-agent

## Problem Statement

Every quiz play draws its questions from a random seed the player never sees. Two friends cannot play the same set of questions and compare scores, and a player cannot replay a set they liked.

## Solution

Each quiz play has a seed code of up to 6 letters and digits. On the intro, the player can type a seed code, or leave the field empty to get a random one. The result screen shows the play's seed code and count, so the player can send them to a friend. The same seed code and count always give the same questions in the same order, with the same option order.

## User Stories

1. As a player, I want to type a seed code under ขั้นสูง on the intro, so that I get the same questions as a friend.
2. As a player, I want the field to accept at most 6 characters, so that a code is short enough to read out or type on a phone.
3. As a player, I want lowercase letters to count as uppercase, so that `abc123` and `ABC123` give the same play.
4. As a player, I want characters other than A to Z and 0 to 9 ignored as I type, so that I cannot enter a code that does not work.
5. As a player, I want an empty field to mean a random play, so that nothing changes when I do not care about codes.
6. As a player, I want to see my play's seed code and count on the result screen, so that I can share them.
7. As a player, I want เล่นอีกครั้ง to give me a new random play, so that playing again does not repeat the same questions.
8. As a player, I want Enter in the seed code field to start the play, as Enter does elsewhere on the intro.
9. As a player, I want a refresh mid-play to keep my play and its seed code.

## Implementation Decisions

- **Seed code ↔ seed.** A seed code is a base-36 number (0–9, A–Z). It converts to the play's numeric seed with no record change: 36⁶ is about 2.18 billion, which fits in the 32-bit seed. The shared quiz module exports `seedFromCode(code)` (returns `null` for a code that is empty, longer than 6, or has other characters; case-insensitive), `seedCode(seed)` (uppercase, zero-padded to 6) and `randomSeed()` (uniform in 0 to 36⁶ − 1).
- **ตั้งค่า (decided in chat during the build).** The intro's settings are three buttons: `20 ข้อ`, `30 ข้อ` and `ขั้นสูง`. A preset is that count with a random seed. ขั้นสูง shows two columns, จำนวนข้อ (a number field for any count) and รหัสชุดคำถาม. The old presets of 50 and ทั้งหมด go; the number field covers them.
- **The intro.** A text field labelled รหัสชุดคำถาม, beside จำนวนข้อ in ขั้นสูง, `maxLength` 6, which uppercases input and drops other characters. Empty means random. เริ่มเลย uses `seedFromCode` of the field, or `randomSeed()` when it is empty.
- **The result.** The score card shows the seed code and the count.
- **Play again and reset** draw a new random seed, as now.
- **Saved play.** Unchanged: the record already holds the numeric seed.

## Assumptions

- The UI name is รหัสชุดคำถาม; the glossary term is **Seed code**.
- A friend needs both the seed code and the count to get the same play; the result shows both, and the field does not encode the count.
- Codes are padded to 6 for display, so `0` and `000000` are the same code.
- A play saved before this change may have a seed above 36⁶ − 1. Its result shows a 7-character code that cannot be typed back in. Such plays age out on the next start.
- The seed code is not shown during play, only on the result screen.

## Testing Decisions

- Test through the quiz module's public interface, as `quiz.test.ts` does.
- `seedFromCode` and `seedCode` round-trip; lowercase equals uppercase; empty, 7-character and non-alphanumeric codes return `null`; `randomSeed()` stays in range and round-trips through `seedCode`.
- The same seed code and count give the same play.

## Out of Scope

- Seed codes for the guessing games (Anime Age, Province, University).
- Encoding the count into the seed code.

## Further Notes

The quiz screen and module are described in `docs/documents/quiz.md`.

## Comments

- Share link (asked for in chat after the first build): the result's seed code is a chip, like the top strip's, and double-click or Enter copies `<page>?seed=CODE&n=COUNT`. Opening that link shows the intro with ขั้นสูง picked and its count and code filled, then drops the query so a refresh restores the play. The link wins over a saved play, which is cleared as the intro shows. `shareQuery` and `readShareQuery` live in the quiz module, tested through its interface.
