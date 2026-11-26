# Quiz

How the quizzes are built: the shared quiz module and screen, the question shape, how a play is drawn, the score bands, the saved play, how to add a title and how to add a question. Terms follow `GLOSSARY.md`; a quiz is a **Quiz**, not a **Game**. The specs are `.scratch/how-well-do-you-know/spec.md` (the first title), `.scratch/naruto-quiz/spec.md` (Naruto and the shared module), `.scratch/quiz-no-reveal/spec.md` (answers held until the result) and `.scratch/quiz-length-and-titles/spec.md` (Dragon Ball, Reborn, any play length and the reveal switch).

One quiz module plays every title, and one screen shows it. A title is data: its questions, its glossary and its score bands.

- **Shared module.** `src/games/quiz/`, pure TypeScript with no React: the question shape, the JSON parsers, the rules, the play, the score-band lookup and the saved play. Code outside it imports only from its `index.ts`; `boundaries.test.ts` fails on a deeper import.
- **Title modules.** One folder per title under `src/games/`, holding `questions.json`, `glossary.json`, `bands.ts` and an `index.ts` that exports the title's quiz. Each has its own `boundaries.test.ts`.
- **Shared screen.** `src/components/quiz-screen.tsx`, the intro, question and result screens. `QuizScreen` takes `{ quiz, title, intro }`. It reuses the shared look (`Shell`, `BigButton`, the `stock` and `option` classes, the sound toggle) but not the shared play screen, which is built around a confidence meter and one guess.
- **Routes.** One static route per title. `page.tsx` holds the metadata and renders a small client component that passes the title's quiz, title and intro to `QuizScreen`. The quiz holds functions, which a server page can't pass to a client component.

| Title | Module | Route |
| --- | --- | --- |
| คุณรู้จัก Dragon Ball ดีแค่ไหน | `src/games/dragon-ball/` | `/dragon-ball` |
| คุณรู้จัก Kuroko no Basket ดีแค่ไหน | `src/games/kuroko-no-basket/` | `/kuroko-no-basket` |
| คุณรู้จัก Naruto ดีแค่ไหน | `src/games/naruto/` | `/naruto` |
| คุณรู้จัก Prince of Tennis ดีแค่ไหน | `src/games/prince-of-tennis/` | `/prince-of-tennis` |
| คุณรู้จัก Reborn ดีแค่ไหน | `src/games/reborn/` | `/reborn` |

## Question shape

A title's bank is its `questions.json`, an array with one object per question: its `id` plus the fields below. `parseQuestions` in `src/games/quiz/bank.ts` reads it into a bank keyed by id, and throws on a question of the wrong shape or a repeated id, so a bad edit fails the tests and the build. The type is in `question.ts`:

```ts
type Tier = "easy" | "medium" | "hard" | "very-hard";

interface QuizQuestion {
  readonly tier: Tier;
  readonly prompt: string;   // Thai
  readonly answer: string;   // the right option's label
  readonly decoys: readonly [string, string, string];
  readonly note?: string;    // one line shown with the answer
  readonly source: string;   // https page that confirms the answer
  readonly evidence?: string; // a short quote from source, for review only
}
```

A title's `glossary.json` is an object keyed by the exact option label, each entry with `romaji`, `kanji` and `english`, and optionally `aka`: other Thai names fans know the same thing by, such as a TV dub's name where the label follows the manga (`"เกี๊ยวซ่า": { "aka": ["…"], … }`). `parseGlossary` in `glosses.ts` reads it, and throws on an entry without all three names or with an `aka` that isn't a list of strings. One entry covers that label wherever it appears: as an answer, as a decoy, or named inside a prompt. Add an `aka` only with a page that shows the name in use; the spec is `.scratch/quiz-aka/spec.md`.

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

`createQuiz(content)` returns a `Quiz`: the content plus `size` (how many questions the bank holds), `start` and `answer`. It throws when a tier has fewer than 5 questions, the share of each tier in a play of 20.

`quizIssues(content)` in `check.ts` checks the rules the types can't express. Each title's `bank.test.ts` requires it to return nothing for the shipped content:

- At least 15 questions in each tier (`MIN_QUESTIONS_PER_TIER`).
- A non-empty prompt, and four non-empty options that are distinct after trimming, so no decoy equals the answer.
- A note, when present, is not empty.
- `source` parses as an `https:` URL.
- Every gloss names an option in the bank, or a term some prompt names (see Prompt terms).
- An `aka` is not empty, doesn't repeat its label or another `aka` of the same entry, and within a question no option's label or `aka` names another option.
- Every score from 0 to 20 falls in exactly one band, and every band has a non-empty title and line.

## A play

A play is its count, its seed and the answer keys so far. `start(seed, count?)` and `answer(play, optionKey)` both rebuild the whole play from those values, so the same count, seed and answers always give the same play.

**Count.** How many questions the play asks, from 5 (`MIN_QUESTIONS_PER_PLAY`) to the bank's size; `start` throws outside that range. It defaults to 20 (`QUESTIONS_PER_PLAY`). The play's `total` is its count. Every finished play has a fan title (below).

**Seed code.** A play's seed written in base 36, so a player can share it (`seed.ts`, spec `.scratch/quiz-seed-code/spec.md`). 36⁶ fits in the 32-bit seed, so the code is the seed itself and the saved play doesn't change. `seedFromCode(code)` reads up to 6 characters, case-insensitive, and returns null for an empty, longer or malformed code. `seedCode(seed)` writes it uppercase, zero-padded to 6. `randomSeed()` draws uniformly from 0 to 36⁶ − 1; every new play, เล่นอีกครั้ง and reset use it. A play saved before seed codes may hold a larger seed, which shows a 7-character code that can't be typed back in.

**Share link.** `shareQuery(seed, count)` writes `?seed=B21X0L&n=20`; `readShareQuery(search)` reads it back, or null for a missing or malformed seed or count. Opening a quiz route with a good link shows the intro with ขั้นสูง picked and the count and code filled, and drops the query so a refresh restores the play; a count out of range falls back to the normal start. The link wins over a saved play.

**Drawing.** One seeded generator (mulberry32) drives the whole draw, in this order:

1. Deal the count over the tiers round-robin, easy first, skipping a tier that has run out. 20 gives 5 per tier, 50 gives 13, 13, 12 and 12, and the bank's size gives every question.
2. For each tier, easy first, sort the tier's ids, shuffle them all, and take that tier's share. Sorting first means the order of the bank file doesn't change a draw. Shuffling the whole tier means the generator moves on the same way whatever the count, so 20 and the bank's size draw exactly what the old standard and all-questions modes drew.
3. For each drawn question, shuffle the answer and the three decoys into four options.

**Option keys.** Each option's key is `<question id>:<slot>`, with slot `a` to `d` by position on screen. A key names its question, so an answer log replayed on a changed bank fails instead of quietly answering other questions.

**Glosses.** An option whose label has a glossary entry carries it as `gloss`.

**Prompt terms.** Each card's `terms` lists the glossary labels its prompt names, such as a move in "ผู้เล่นชิเทนโฮจิคนใดเปิดประตูไซกิ คัมปัตสึ โนะ คิวามิ ได้?", each with its gloss. `termsIn` in `glosses.ts` finds them. Thai has no spaces, so a label counts only where it starts and ends on a word boundary from `Intl.Segmenter("th")`: นภา is found in แหวนแห่งนภา but not inside ในภาคอนาคต. Where labels overlap the longest wins, and each label is listed once, in the order it appears. A prompt's terms are worked out once per quiz, not on every draw.

**Phases.** The play is a union on `phase`:

| Field | `asking` | `finished` |
| --- | --- | --- |
| `total`, `seed`, `answerKeys` | yes | yes |
| `answered` | each answer so far, with its question, the right key, the chosen key, `correct`, the note and the source | all of them |
| `score` | right answers so far | the final score |
| `question` | the current question: id, tier, number 1 to `total`, prompt, prompt terms, four options | |
| `band` | | the score band, for the score scaled to 20 |

`answer` throws on a key that isn't one of the current question's options, and on a finished play.

**The reveal switch.** เฉลยทุกข้อ decides whether each answer shows right away. It is a preference, not part of the play: `src/lib/quiz-reveal.ts` keeps it in localStorage under `knowyou:quiz-reveal`, off by default, one choice for every title, and `useRevealOn` reads it like the sound switch.

- **Off.** An answer goes straight to the next question. Nothing on screen or in the sound says whether it was right until the result.
- **On.** After an answer the screen shows right or wrong before the next question. The screen keeps one number, `seen`: how many answers the player has moved past. While the switch is on and `seen` is less than `play.answered.length`, the last answer is on show; ข้อต่อไป or Enter sets `seen` to the log's length.
- **Flipped mid-play.** Turning it on shows the reveal from the next answer. Turning it off during a reveal, here or in another tab, sets `seen` to the log's length, so the play moves on.

## Score bands

Each title's `bands.ts` holds its bands for a score out of 20, lowest first. `bandFor(bands, score)` returns the one band that holds the score. A play of any other count is scaled first: its band is the one for `Math.round(score * 20 / total)`, so 40 of 50 earns the 16 band and 49 of 50 the 20 band.

**Dragon Ball** (`SCORE_BANDS` in `src/games/dragon-ball/bands.ts`), as fighter ranks:

| Score | Title | Line |
| --- | --- | --- |
| 0–4 | ชาวบ้านธรรมดา | ยังขี่เมฆสีทองไม่ได้เลย กลับไปส่งนมกับผู้เฒ่าเต่าก่อนนะ |
| 5–8 | ศิษย์สำนักเต่า | ได้เสื้อสีส้มมาแล้ว แต่ยังต้องแบกกระดองเต่าวิ่งอีกหลายรอบ |
| 9–12 | นักสู้ศึกชิงเจ้ายุทธภพ | ฝีมือขนาดนี้ ผ่านเข้ารอบสุดท้ายของศึกชิงเจ้ายุทธภพได้สบาย |
| 13–16 | ซูเปอร์ไซย่า | ผมเปลี่ยนเป็นสีทองแล้ว ความรู้ของคุณระเบิดออกมาเต็มที่ |
| 17–20 | นักรบผู้ปกป้องโลก | ต่อให้จอมมารบูมาก็ไม่กลัว คุณรู้จักดราก้อนบอลทุกซอกทุกมุม |

**Kuroko no Basket** (`SCORE_BANDS` in `src/games/kuroko-no-basket/bands.ts`), as basketball ranks:

| Score | Title | Line |
| --- | --- | --- |
| 0–4 | คนดูข้างสนาม | ยังแยกไม่ออกเลยว่าใครคือคุโรโกะ ลองมองดี ๆ อีกครั้งนะ |
| 5–8 | ตัวสำรองชมรมปีหนึ่ง | ได้ใส่เสื้อทีมแล้ว แต่ต้องวิ่งรอบสนามตามเมนูของริโกะอีกเยอะ |
| 9–12 | ตัวจริงเซย์ริน | ลงสนามได้แล้ว พร้อมส่งบอลให้แสงสว่างของทีม |
| 13–16 | ราชันไร้มงกุฎ | ฝีมือระดับนี้ ใคร ๆ ก็ยอมรับ แม้จะยังไม่ได้มงกุฎ |
| 17–20 | รุ่นปาฏิหาริย์ | คุณรู้จักเรื่องนี้ทุกซอกทุกมุม ราวกับเป็นผู้เล่นคนที่หกผู้เป็นเงาเอง |

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

**Reborn** (`SCORE_BANDS` in `src/games/reborn/bands.ts`), as mafia ranks:

| Score | Title | Line |
| --- | --- | --- |
| 0–4 | สึนะไม่ได้เรื่อง | ยังไม่โดนกระสุนดับเครื่องชนสักนัด รีบอร์นคงต้องเริ่มสอนใหม่ตั้งแต่ต้น |
| 5–8 | ลูกน้องแฟมิลี่ | เข้าแฟมิลี่มาแล้ว แต่ยังต้องคอยหลบบาซูก้าทศวรรษของแรมโบ้ |
| 9–12 | ผู้พิทักษ์วองโกเล่ | ได้แหวนวองโกเล่มาแล้ว พร้อมออกศึกปกป้องบอสของคุณ |
| 13–16 | สมาชิกวาเรีย | ฝีมือระดับนี้ ซันซัสคงอยากชวนเข้าหน่วยลอบสังหาร |
| 17–20 | บอสวองโกเล่รุ่นที่ 10 | รีบอร์นยอมรับคุณแล้ว คุณพร้อมสืบทอดวองโกเล่ |

## Saved play

The same rules as the games' saved play (`play-screen.md`), in the quiz's own `record.ts`, because `src/lib/play-record.ts` is typed to the game `Engine`.

- **The record.** `{ v: 1, count?, seed, answerKeys }`, with `count` left out for a play of 20, in localStorage under `quizRecordKey(quiz)`: `knowyou:play:<id>`, such as `knowyou:play:prince-of-tennis` or `knowyou:play:naruto`. Each title keeps its own saved play. The reveal switch is not in the record.
- **Older records.** A record saved before counts existed has no `count`, and restores as a play of 20; one with `mode: "all"` restores as the bank's size. Both draw the same play they drew before.
- **When it is saved.** After every answer. A play with no answers is not saved.
- **When it is cleared.** On เริ่มเลย, on เล่นอีกครั้ง, on a confirmed reset, and when a record fails to restore.
- **Restoring.** `restoreQuiz` starts the play from the seed and replays each key. A record that isn't JSON, has another `v`, an unknown mode, a count that isn't a number or is out of range, a malformed seed or keys, holds a key the play rejects, or holds more answers than the play asks is dropped silently, and the intro shows. A restored play opens at the next question, past any reveal.

## Screens and sound

- **Intro.** The title, the title's intro lines, ตั้งค่า, the เฉลยทุกข้อ switch (a card-wide row with a pill switch, `role="switch"`), and เริ่มเลย (or Enter). ตั้งค่า has three buttons: `20 ข้อ` and `30 ข้อ` (a play of that count with a random seed) and `ขั้นสูง`. 20 is picked when the page opens. ขั้นสูง shows two columns, stacked on a phone: จำนวนข้อ, a number field between − and + buttons (no native spinner; a step from an empty or out-of-range field lands back in range) for any count from 5 to the bank's size, and รหัสชุดคำถาม, the seed code. A count out of range turns the hint under the field red and disables เริ่มเลย. รหัสชุดคำถาม takes up to 6 characters, uppercases them as typed and drops anything but A–Z and 0–9; empty means a random seed (see Seed code). A dice button on its right (สุ่มรหัส) fills in a random code. The stepper and dice buttons sit 4px inside the field, so their hover fill never covers its border. Both fields keep their values if the player switches away from ขั้นสูง and back. Enter on a focused button presses that button, so it picks its setting. Sound `start`.
- **Question.** a progress chip in the top strip (N/total over a thin accent bar, `role="progressbar"`), and beside it a mint score chip (a check and the right answers so far) only while the reveal switch is on and the screen is at least `sm` wide (a phone's strip has no room beside three buttons), then the tier as a pill badge (`.tier-badge`, tinted mint, blue, purple or red from easy to very hard), the prompt, and four options. Tap or press 1 to 4. With the switch off: sound `answer` (`guess` on the last answer) and the next question shows. With it on: sound `right` or `wrong` and the reveal shows.
- **Reveal.** Only with the switch on. The options lock. A check and ถูกต้อง!, or a cross and the right answer, in colour, icon and text. The right option is tagged คำตอบที่ถูก, a wrong choice is tagged คุณเลือก, and the note shows when there is one. ข้อต่อไป (ดูคะแนน after the last question) or Enter moves on.
- **Seed code in the top strip.** From `sm` up, a chip left of ข้อ N/total shows `รหัส` and the seed code, on the question and reveal screens. Double-click it, or press Enter on it, to copy the code; the chip turns mint and says คัดลอกแล้ว for 1.5 s. Seed codes everywhere (chip, result, field) use a monospace font with a slashed zero, so 0 and O never look alike.
- **Reveal switch in the top strip.** An eye icon button, `aria-pressed`, beside the reset and sound buttons on the question and reveal screens: an open eye when on, a crossed eye when off.
- **Other names.** A label whose gloss has an `aka` shows those names right after it in small muted text: `โกคู โงกุน`. This holds on options, prompt terms and the right answer in เฉลย.
- **Glosses.** Under an option with a gloss, two lines: `Romaji, 漢字` then the English name. The same shows under the right answer in เฉลย. Under a prompt that names glossary terms, each term shows as a small card (the label in bold, then the same two lines), two cards across from `sm` up, on the question and reveal screens.
- **Reset.** The question and reveal screens pass `playAgain` to `Shell` as `onReset`, so the top strip shows the reset button (`play-screen.md`). A confirmed reset starts a new play of the same count at question 1.
- **Result.** The score out of `total`, the band title and line, the seed code as a chip that copies the share link on double-click or Enter (it says คัดลอกลิงก์แล้ว; its tooltip says so), and the count as a chip beside it. Right under that card comes เล่นอีกครั้ง, on a paper band that sticks to the top of the viewport once the page scrolls past it, so เฉลย scrolls under it. Then เฉลย: every question with a check or cross, its right answer, the player's answer on a miss, and the note when there is one. เล่นอีกครั้ง starts a new play of the same count. Sound `guess` when it opens.

## How to add a title

1. Create `src/games/<id>/`, with `<id>` the route slug in kebab-case.
2. Add `questions.json` and `glossary.json` in the shapes above, with at least 15 questions in each tier.
3. Add `bands.ts`, exporting the score bands from 0 to 20, lowest first.
4. Add `index.ts`, exporting `createQuiz({ id, bank: parseQuestions(questions), glosses: parseGlossary(glossary), bands })` from `../quiz`.
5. Add `bank.test.ts`, requiring `quizIssues` of the quiz to be empty, and copy `boundaries.test.ts` with the module's folder.
6. Add `src/app/<id>/page.tsx` with the metadata, and a client component beside it that renders `QuizScreen` with the quiz, the title and the intro lines.
7. Add the title to `QUIZZES` in `src/app/page.tsx`, in href order.
8. Add the title to the table at the top of this document, and its bands under Score bands.
9. Run `bun test`, `bun run typecheck` and `bun run build`.

## How to add a question

1. Find a page that confirms the answer, such as the series wiki or Wikipedia. Keep to the title's scope:
   - Dragon Ball: the manga and the TV anime Dragon Ball and Dragon Ball Z, canon story only, up to the end of the Majin Buu arc. No filler, films, OVAs, GT, Super, Daima or games. Ask only about named moves, transformations and items, places and groups, teachers and rivals, aliases, and story events. Glosses cover techniques, transformations, fusions and named items, and characters whose other Thai names (a TV dub's, an older edition's) are sourced in `.scratch/quiz-aka/spec.md`, such as โกคู (โงกุน). Keep only the best-known other name, not every spelling.
   - Kuroko no Basket: the manga, the three TV seasons and the EXTRA GAME sequel. No *Last Game* film-only changes, novels, games or stage plays. Ask only about moves, schools, team roles, nicknames and story events; no birthdays, heights, numbers, scores or personal trivia. Source the Kuroko no Basuke wiki (`kurokonobasuke.fandom.com`). Glosses cover named moves and abilities. The spec is `.scratch/kuroko-quiz/spec.md`.
   - Naruto: Naruto and Naruto Shippuden, up to the end of the Fourth Shinobi World War. No Boruto, films or games. Glosses cover jutsu, dōjutsu, swords, elements and lands; a land's `aka` holds the Thai Wikipedia names (แคว้นเหล็ก, เทะซึโนะคุนิ).
   - Prince of Tennis: the manga, the TV anime and the National Tournament OVAs, up to the end of the National Tournament. Ask only about moves and special moves, schools, or story events. Don't ask about birthdays, numbers, scores or personal trivia (family, pets, hobbies, food). The research brief is `prince-of-tennis-quiz-format.md`.
   - Reborn: the whole Katekyo Hitman Reborn! manga, to the end of the Curse of the Rainbow, and the TV anime where it follows the manga. No anime-only arcs, OVAs, light novels or games. Name the manga when an arc is manga-only. Glosses cover flame attributes, techniques, rings, gear and Tri-ni-sette items.
2. Add an object to the title's `questions.json` with a new, stable `id`. Never reuse or rename an id, because a saved play names its questions by id.
3. Write the prompt, the answer and three plausible decoys in the spellings Thai fans use.
4. If an option, or a move or term the prompt names, is a Japanese name or a Thai translation of one, add its `romaji`, `kanji` and `english` names to the title's `glossary.json`, keyed by the exact label. Write the prompt with the label exactly as the glossary spells it, so the screen finds it.
5. Set the tier, the page's URL as `source`, and a short quote from that page as `evidence`. Add a one-line `note` if it makes the เฉลย better.
6. Run `bun test src/games/<id>`.
