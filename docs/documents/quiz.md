# Quiz

How the quizzes are built: the shared quiz module and screen, the question shape, how a play is drawn, the score bands, the saved play, how to add a title and how to add a question. Terms follow `GLOSSARY.md`; a quiz is a **Quiz**, not a **Game**. The specs are `.scratch/how-well-do-you-know/spec.md` (the first title) and `.scratch/naruto-quiz/spec.md` (Naruto and the shared module).

One quiz module plays every title, and one screen shows it. A title is data: its questions, its glossary and its score bands.

- **Shared module.** `src/games/quiz/`, pure TypeScript with no React: the question shape, the JSON parsers, the rules, the play, the score-band lookup and the saved play. Code outside it imports only from its `index.ts`; `boundaries.test.ts` fails on a deeper import.
- **Title modules.** One folder per title under `src/games/`, holding `questions.json`, `glossary.json`, `bands.ts` and an `index.ts` that exports the title's quiz. Each has its own `boundaries.test.ts`.
- **Shared screen.** `src/components/quiz-screen.tsx`, the intro, question, reveal and result screens. `QuizScreen` takes `{ quiz, title, intro }`. It reuses the shared look (`Shell`, `BigButton`, the `stock` and `option` classes, the sound toggle) but not the shared play screen, which is built around a confidence meter and one guess.
- **Routes.** One static route per title. `page.tsx` holds the metadata and renders a small client component that passes the title's quiz, title and intro to `QuizScreen`. The quiz holds functions, which a server page can't pass to a client component.

| Title | Module | Route |
| --- | --- | --- |
| คุณรู้จัก Naruto ดีแค่ไหน | `src/games/naruto/` | `/naruto` |
| คุณรู้จัก Prince of Tennis ดีแค่ไหน | `src/games/prince-of-tennis/` | `/prince-of-tennis` |

## Question shape

A title's bank is its `questions.json`, an array with one object per question: its `id` plus the fields below. `parseQuestions` in `src/games/quiz/bank.ts` reads it into a bank keyed by id, and throws on a question of the wrong shape or a repeated id, so a bad edit fails the tests and the build. The type is in `question.ts`:

```ts
type Tier = "easy" | "medium" | "hard" | "very-hard";

interface QuizQuestion {
  readonly tier: Tier;
  readonly prompt: string;   // Thai
  readonly answer: string;   // the right option's label
  readonly decoys: readonly [string, string, string];
  readonly note?: string;    // one line shown after the answer
  readonly source: string;   // https page that confirms the answer
  readonly evidence?: string; // a short quote from source, for review only
}
```

A title's `glossary.json` is an object keyed by the exact option label, each entry with `romaji`, `kanji` and `english`. `parseGlossary` in `glosses.ts` reads it, and throws on an entry without all three. One entry covers that label wherever it appears, as an answer or a decoy.

## A title's content

A title module builds its quiz from one value:

```ts
interface QuizContent {
  readonly id: string;                               // the route slug; it also names the saved play
  readonly bank: QuestionBank;                       // from questions.json
  readonly glosses: Readonly<Record<string, Gloss>>; // from glossary.json
  readonly bands: readonly ScoreBand[];              // cover 0..20, lowest first
}
```

`createQuiz(content)` returns a `Quiz`: the content plus `start` and `answer`.

`quizIssues(content)` in `check.ts` checks the rules the types can't express. Each title's `bank.test.ts` requires it to return nothing for the shipped content:

- At least 15 questions in each tier (`MIN_QUESTIONS_PER_TIER`).
- A non-empty prompt, and four non-empty options that are distinct after trimming, so no decoy equals the answer.
- A note, when present, is not empty.
- `source` parses as an `https:` URL.
- Every gloss names an option in the bank.
- Every score from 0 to 20 falls in exactly one band, and every band has a non-empty title and line.

## A play

A play is its mode, its seed and the answer keys so far. `start(seed, mode?)` and `answer(play, optionKey)` both rebuild the whole play from those values, so the same mode, seed and answers always give the same play.

**Modes.** `standard` (the default) asks 20 questions, 5 per tier, and ends with a fan title. `all` asks every question in the bank, easiest tier first and shuffled within each tier, and ends with the score out of the bank size and no fan title (`band` is `null`). The play's `total` is the number of questions it asks.

**Drawing.** One seeded generator (mulberry32) drives the whole draw, in this order:

1. For each tier, easy first, sort the tier's ids, shuffle them, and take the first 5 (all of them in `all` mode). Sorting first means the order of the bank file doesn't change a draw.
2. For each drawn question, shuffle the answer and the three decoys into four options.

**Option keys.** Each option's key is `<question id>:<slot>`, with slot `a` to `d` by position on screen. A key names its question, so an answer log replayed on a changed bank fails instead of quietly answering other questions.

**Glosses.** An option whose label has a glossary entry carries it as `gloss`.

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

Each title's `bands.ts` holds its bands, lowest first. `bandFor(bands, score)` returns the one band that holds the score.

**Naruto** (`SCORE_BANDS` in `src/games/naruto/bands.ts`), as ninja ranks:

| Score | Title | Line |
| --- | --- | --- |
| 0–4 | นักเรียนโรงเรียนนินจา | ยังสอบคาถาแยกร่างไม่ผ่านเลย กลับไปทบทวนกับอิรุกะเซนเซก่อนนะ |
| 5–8 | เกะนินหน้าใหม่ | ได้ผ้าคาดหัวมาแล้ว แต่ภารกิจที่ได้ยังเป็นแค่ตามหาแมวหาย |
| 9–12 | จูนิน | ผ่านการสอบจูนินมาได้ พร้อมนำทีมออกภารกิจของตัวเองแล้ว |
| 13–16 | โจนินฝีมือฉกาจ | ฝีมือระดับนี้ พร้อมรับเกะนินมาปั้นเป็นทีมของตัวเองแบบคาคาชิแล้ว |
| 17–20 | โฮคาเงะ | ทั้งหมู่บ้านยอมรับคุณแล้ว ใบหน้าของคุณควรไปอยู่บนผาโฮคาเงะ |

**Prince of Tennis** (`SCORE_BANDS` in `src/games/prince-of-tennis/bands.ts`):

| Score | Title | Line |
| --- | --- | --- |
| 0–4 | ยังอ่อนหัดนัก | ไปวิ่งรอบสนามอีกสักสิบรอบ แล้วค่อยกลับมาใหม่นะ |
| 5–8 | เด็กเก็บลูกชมรมปีหนึ่ง | ยังได้แต่เก็บลูกข้างสนาม แต่ตัวจริงทุกคนก็เริ่มจากตรงนี้ |
| 9–12 | ตัวจริงของชมรม | ผ่านการคัดตัวมาได้ แต่น้ำผักของอินุอิยังรอคุณอยู่ |
| 13–16 | ตัวแทนระดับคันโต | ฝีมือขนาดนี้ อย่าประมาท แล้วไปให้ถึงระดับประเทศ |
| 17–20 | เจ้าชายแห่งเทนนิส | คุณรู้จักเรื่องนี้ดีราวกับยืนอยู่ในสนามเอง |

## Saved play

The same rules as the games' saved play (`play-screen.md`), in the quiz's own `record.ts`, because `src/lib/play-record.ts` is typed to the game `Engine`.

- **The record.** `{ v: 1, mode?, seed, answerKeys }`, with `mode` left out for a standard play so older records still restore, in localStorage under `quizRecordKey(quiz)`: `knowyou:play:<id>`, such as `knowyou:play:prince-of-tennis` or `knowyou:play:naruto`. Each title keeps its own saved play.
- **When it is saved.** After every answer. A play with no answers is not saved.
- **When it is cleared.** On เริ่มเลย, on เล่นอีกครั้ง, on a confirmed reset, and when a record fails to restore.
- **Restoring.** `restoreQuiz` starts the play from the seed and replays each key. A record that isn't JSON, has another `v`, an unknown mode, a malformed seed or keys, holds a key the play rejects, or holds more answers than the play asks is dropped silently, and the intro shows. A restored play opens at the next question, past the last reveal.

## Screens and sound

- **Intro.** The title, the title's intro lines, เริ่มเลย (or Enter) for a standard play, and ตอบทุกข้อ (N ข้อ) for an `all` play. Sound `start`.
- **Question.** ข้อ N/total and the running score in the top strip, the tier, the prompt, and four options. Tap or press 1 to 4. Sound `right` or `wrong` on the answer.
- **Reveal.** The options lock. A check and ถูกต้อง!, or a cross and the right answer, in colour, icon and text. The right option is tagged คำตอบที่ถูก, a wrong choice is tagged คุณเลือก, and the note shows when there is one. ข้อต่อไป (ดูคะแนน after the last question) or Enter moves on.
- **Glosses.** Under an option with a gloss, two lines: `Romaji, 漢字` then the English name. The same shows under the right answer in เฉลย.
- **Reset.** The question and reveal screens pass `playAgain` to `Shell` as `onReset`, so the top strip shows the reset button (`play-screen.md`). A confirmed reset starts a new play in the same mode at question 1.
- **Result.** The score out of `total`, the band title and line (standard only), every question with its right answer and, on a miss, the player's answer, and เล่นอีกครั้ง, which starts a new play in the same mode. Sound `guess` when it opens.

## How to add a title

1. Create `src/games/<id>/`, with `<id>` the route slug in kebab-case.
2. Add `questions.json` and `glossary.json` in the shapes above, with at least 15 questions in each tier.
3. Add `bands.ts`, exporting the score bands from 0 to 20, lowest first.
4. Add `index.ts`, exporting `createQuiz({ id, bank: parseQuestions(questions), glosses: parseGlossary(glossary), bands })` from `../quiz`.
5. Add `bank.test.ts`, requiring `quizIssues` of the quiz to be empty, and copy `boundaries.test.ts` with the module's folder.
6. Add `src/app/<id>/page.tsx` with the metadata, and a client component beside it that renders `QuizScreen` with the quiz, the title and the intro lines.
7. Add the title to `GAMES` in `src/app/page.tsx`, in href order.
8. Add the title to the table at the top of this document, and its bands under Score bands.
9. Run `bun test`, `bun run typecheck` and `bun run build`.

## How to add a question

1. Find a page that confirms the answer, such as the series wiki or Wikipedia. Keep to the title's scope:
   - Naruto: Naruto and Naruto Shippuden, up to the end of the Fourth Shinobi World War. No Boruto, films or games. Glosses cover jutsu, dōjutsu, swords and elements.
   - Prince of Tennis: the manga, the TV anime and the National Tournament OVAs, up to the end of the National Tournament. Ask only about moves and special moves, schools, or story events. Don't ask about birthdays, numbers, scores or personal trivia (family, pets, hobbies, food). The research brief is `prince-of-tennis-quiz-format.md`.
2. Add an object to the title's `questions.json` with a new, stable `id`. Never reuse or rename an id, because a saved play names its questions by id.
3. Write the prompt, the answer and three plausible decoys in the spellings Thai fans use.
4. If an option is a Japanese name, or a Thai translation of one, add its `romaji`, `kanji` and `english` names to the title's `glossary.json`, keyed by the exact label.
5. Set the tier, the page's URL as `source`, and a short quote from that page as `evidence`. Add a one-line `note` if it makes the reveal better.
6. Run `bun test src/games/<id>`.
