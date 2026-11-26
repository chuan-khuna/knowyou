# Spec: Hold the answers until the end of a quiz

Status: ready-for-agent

A change to every **Quiz** title (Prince of Tennis and Naruto). Terms follow `GLOSSARY.md`. The quiz screen is described in `docs/documents/quiz.md`.

## Problem Statement

After each answer the quiz screen shows whether it was right and what the right answer is. The user asked for the answers to wait: "ยังไม่ต้องเฉลยทุกครั้งที่ตอบ". A player should go through the whole quiz first and see the answers only at the end.

## Solution

Choosing an option moves straight to the next question. Nothing on screen or in the sound tells the player whether the answer was right. After the last answer the result screen opens, with the score, the fan title and the full เฉลย, which now also shows each question's note.

## User Stories

1. As a player, I want to go to the next question as soon as I answer, so that the quiz keeps moving.
2. As a player, I don't want to learn mid-play whether I was right, so that the result at the end is the reveal.
3. As a player, I want the notes I used to see after each answer in the เฉลย, so that I still learn something.
4. As a player with a play saved mid-quiz, I want it to restore at the next question, as before.

## Implementation Decisions

- The quiz module and the saved play do not change. Only the screen changes.
- The screen drops the reveal step and its `seen` counter. An answer goes straight to the next question, or to the result after the last one.
- The top strip shows ข้อ N/total and no running score.
- An answer plays the neutral `answer` sound, not `right` or `wrong`. The last answer plays `guess` as the result opens.
- Each เฉลย item shows the question's note, when it has one, under the answers.
- The reset button no longer stops Enter: with no reveal, nothing on a quiz or game screen reads Enter while the reset button shows.

## Testing Decisions

- No module behaviour changes, so the existing tests stand.
- In the running app: an answer moves to the next question with no verdict; the top strip shows no score; the result shows the score, the title and every answer with its note; a refresh mid-play restores at the next question.

## Out of Scope

- An option to turn the answer after each question back on.
- Changes to the games (Anime Age, Province, University).

## Assumptions

Taken without asking, per `CLAUDE.md`. Veto any of these by editing this list.

- The change applies to both quiz titles and both modes, standard and ตอบทุกข้อ.
- The running score is hidden too, because it would show whether each answer was right.
- The answer sound is the neutral `answer` cue, because `right` and `wrong` would give the answer away.
- The result screen keeps its current shape: score, fan title, then เฉลย.
