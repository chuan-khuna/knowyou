# Prince of Tennis quiz

How the quiz คุณรู้จัก Prince of Tennis ดีแค่ไหน is built: the question shape, how a play is drawn, the score bands, the saved play, and how to add a question. Terms follow `GLOSSARY.md`; this is a **Quiz**, not a **Game**. The spec is `.scratch/how-well-do-you-know/spec.md`.

- **Module.** `src/games/prince-of-tennis/`, pure TypeScript with no React. Code outside it imports only from its `index.ts`; `boundaries.test.ts` fails on a deeper import.
- **Route.** `src/app/prince-of-tennis/`, the intro, question, reveal and result screens. It reuses the shared look (`Shell`, `BigButton`, the `stock` and `option` classes, the sound toggle) but not the shared play screen, which is built around a confidence meter and one guess.

## Question shape

The bank is `src/games/prince-of-tennis/bank.ts`, an object keyed by question id, so a duplicate id is a compile error. The type is in `question.ts`:

```ts
type Tier = "easy" | "medium" | "hard" | "very-hard";

interface QuizQuestion {
  readonly tier: Tier;
  readonly prompt: string;   // Thai
  readonly answer: string;   // the right option's label
  readonly decoys: readonly [string, string, string];
  readonly note?: string;    // one line shown after the answer
  readonly source: string;   // https page that confirms the answer
}
```

`bankIssues(bank)` in `check.ts` checks the rules the types can't express, and `bank.test.ts` requires it to return nothing for the shipped bank:

- At least 15 questions in each tier (`MIN_QUESTIONS_PER_TIER`).
- A non-empty prompt, and four non-empty options that are distinct after trimming, so no decoy equals the answer.
- A note, when present, is not empty.
- `source` parses as an `https:` URL.

## A play

A play is its mode, its seed and the answer keys so far. `createQuiz(bank)` returns `start(seed, mode?)` and `answer(play, optionKey)`, and both rebuild the whole play from those values, so the same mode, seed and answers always give the same play.

**Modes.** `standard` (the default) asks 20 questions, 5 per tier, and ends with a fan title. `all` asks every question in the bank, easiest tier first and shuffled within each tier, and ends with the score out of the bank size and no fan title (`band` is `null`). The play's `total` is the number of questions it asks. `princeOfTennisQuiz` is the quiz over the shipped bank.

**Drawing.** One seeded generator (mulberry32) drives the whole draw, in this order:

1. For each tier, easy first, sort the tier's ids, shuffle them, and take the first 5 (all of them in `all` mode). Sorting first means the order of the bank file doesn't change a draw.
2. For each drawn question, shuffle the answer and the three decoys into four options.

**Option keys.** Each option's key is `<question id>:<slot>`, with slot `a` to `d` by position on screen. A key names its question, so an answer log replayed on a changed bank fails instead of quietly answering other questions.

**Phases.** The play is a union on `phase`:

| Field | `asking` | `finished` |
| --- | --- | --- |
| `mode`, `seed`, `total`, `answerKeys` | yes | yes |
| `answered` | each answer so far, with its question, the right key, the chosen key, `correct`, the note and the source | all of them |
| `score` | right answers so far | the final score |
| `question` | the current question: id, tier, number 1 to `total`, prompt, four options | |
| `band` | | the score band, or `null` in `all` mode |

`answer` throws on a key that isn't one of the current question's options, and on a finished play.

**The reveal.** After an answer the screen shows right or wrong before the next question. The screen keeps one number, `seen`: how many answers the player has moved past. While `seen` is less than `play.answered.length`, the last answer is on show; ข้อต่อไป or Enter sets `seen` to the log's length. Nothing else marks the reveal, so it can't disagree with the play.

## Score bands

`SCORE_BANDS` in `bands.ts`, lowest first. `bandFor(score)` returns the one band that holds the score.

| Score | Title | Line |
| --- | --- | --- |
| 0–4 | ยังอ่อนหัดนัก | ไปวิ่งรอบสนามอีกสักสิบรอบ แล้วค่อยกลับมาใหม่นะ |
| 5–8 | เด็กเก็บลูกชมรมปีหนึ่ง | ยังได้แต่เก็บลูกข้างสนาม แต่ตัวจริงทุกคนก็เริ่มจากตรงนี้ |
| 9–12 | ตัวจริงของชมรม | ผ่านการคัดตัวมาได้ แต่น้ำผักของอินุอิยังรอคุณอยู่ |
| 13–16 | ตัวแทนระดับคันโต | ฝีมือขนาดนี้ อย่าประมาท แล้วไปให้ถึงระดับประเทศ |
| 17–20 | เจ้าชายแห่งเทนนิส | คุณรู้จักเรื่องนี้ดีราวกับยืนอยู่ในสนามเอง |

## Saved play

The same rules as the games' saved play (`play-screen.md`), in the quiz's own `record.ts`, because `src/lib/play-record.ts` is typed to the game `Engine`.

- **The record.** `{ v: 1, mode?, seed, answerKeys }`, with `mode` left out for a standard play so older records still restore, in localStorage under `knowyou:play:prince-of-tennis`.
- **When it is saved.** After every answer. A play with no answers is not saved.
- **When it is cleared.** On เริ่มเลย, on เล่นอีกครั้ง, and when a record fails to restore.
- **Restoring.** `restoreQuiz` starts the play from the seed and replays each key. A record that isn't JSON, has another `v`, an unknown mode, a malformed seed or keys, holds a key the play rejects, or holds more answers than the play asks is dropped silently, and the intro shows. A restored play opens at the next question, past the last reveal.

## Screens and sound

- **Intro.** The title, two lines about the quiz, เริ่มเลย (or Enter) for a standard play, and ตอบทุกข้อ (N ข้อ) for an `all` play. Sound `start`.
- **Question.** ข้อ N/total and the running score in the top strip, the tier, the prompt, and four options. Tap or press 1 to 4. Sound `right` or `wrong` on the answer.
- **Reveal.** The options lock. A check and ถูกต้อง!, or a cross and the right answer, in colour, icon and text. The right option is tagged คำตอบที่ถูก, a wrong choice is tagged คุณเลือก, and the note shows when there is one. ข้อต่อไป (ดูคะแนน after the last question) or Enter moves on.
- **Result.** The score out of `total`, the band title and line (standard only), every question with its right answer and, on a miss, the player's answer, and เล่นอีกครั้ง, which starts a new play in the same mode. Sound `guess` when it opens.

## How to add a question

1. Find a page that confirms the answer, such as the Prince of Tennis wiki or Wikipedia. Keep to the manga, the TV anime and the National Tournament OVAs, up to the end of the National Tournament.
2. Add an entry to `bank.ts` under a new, stable id. Never reuse or rename an id.
3. Ask only about moves and special moves, schools, or story events. Don't ask about birthdays, numbers, scores or personal trivia (family, pets, hobbies, food).
4. Write the prompt, the answer and three plausible decoys in the spellings Thai fans use.
5. If an option is a Japanese technique name, or a Thai translation of one, add its romaji, kanji and English name to `GLOSSES` in `glosses.ts`, keyed by the exact label. Under the option they show as two lines, `Romaji, 漢字` then the English name, and the same under the right answer in เฉลย.
6. Set the tier, and the page's URL as `source`. Add a one-line `note` if it makes the reveal better.
7. Run `bun test src/games/prince-of-tennis`.
