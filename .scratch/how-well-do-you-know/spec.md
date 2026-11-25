# Spec: คุณรู้จัก Prince of Tennis ดีแค่ไหน

Status: ready-for-agent

A new quiz in the KnowYou app, separate from Anime Age. Terms follow `GLOSSARY.md`. This is a **Quiz**, not a **Game**: it guesses nothing, it scores the player. The decisions come from a grilling session on 2026-11-25, recorded under Grill decisions at the end. Anime Age is the precedent for code layout, tests and UI: `docs/documents/anime-age-engine.md`, `docs/documents/play-screen.md` and `src/games/anime-age/`.

## Problem Statement

Thai fans of Prince of Tennis want to test how well they know the series, and to get a fun title that says what kind of fan they are. The KnowYou app has only guessing games. Those guess a fact about the player and never mark an answer right or wrong, so none of them can do this.

## Solution

A quiz at `/prince-of-tennis`, listed on the home page as "คุณรู้จัก Prince of Tennis ดีแค่ไหน". One play asks 20 multiple-choice questions about Prince of Tennis, from the start of the story to the end of the National Tournament. The 20 questions are 5 easy, 5 medium, 5 hard and 5 very hard. They are drawn at random from a bank of at least 60, and shown easiest tier first. After each answer the player sees right or wrong, and the right answer on a miss. Then they move to the next question. At the end they see their score out of 20, a fan title from one of 5 score bands, every question with its right answer and their own answer, and a play-again button.

## User Stories

1. As a player, I want to start the quiz from the home page, so that I find it next to the other games.
2. As a player, I want a short intro that says how many questions there are and that I see the answers as I go, so that I know what I'm in for.
3. As a player, I want 20 questions a play, so that a play is long enough to mean something but short enough to finish.
4. As a player, I want the questions to start easy and get harder, so that a casual fan isn't put off on the first question.
5. As a player, I want 5 questions from each tier, so that every play is equally hard.
6. As a player, I want different questions each time I play, so that playing again is still a test.
7. As a player, I want four answer options for each question, so that guessing is a real choice.
8. As a player, I want the right answer's position to change between plays, so that I can't learn "it's always the first one".
9. As a player, I want to pick an answer with a tap or a number key, as in Anime Age, so that the quiz feels like the rest of the app.
10. As a player, I want to see at once whether I was right, so that every question has its own little reveal.
11. As a player who answered wrong, I want to see the right answer, so that I learn something.
12. As a player, I want an optional one-line note after some answers, such as which episode or match it was, so that the reveal is more interesting.
13. As a player, I want to move on with a "ข้อต่อไป" button or the Enter key, so that I control the pace.
14. As a player, I want to see which question I'm on (for example ข้อ 7/20) and my running score, so that I know how I'm doing.
15. As a player, I want no timer, so that I can think.
16. As a player, I want the sounds Anime Age uses for right and wrong, with the same mute switch, so that the reveal feels alive.
17. As a player, I want a final score out of 20, so that I can compare with friends.
18. As a player, I want a fan title from my score band, so that the result is fun to read.
19. As a player, I want a list of every question with the right answer and my answer, so that I can review my misses.
20. As a player, I want a play-again button, so that I can try for a higher score.
21. As a player, I want a quiz in progress to survive a page refresh, so that a reload doesn't throw away my answers.
22. As a player, I want character, school and move names written the way Thai fans know them, so that I recognise them.
23. As a player, I want every answer to be correct, so that I can trust the quiz.
24. As a question author, I want to write a question as a prompt, a right answer, three wrong answers, a tier and a source link, so that adding a question is quick and reviewable.
25. As a maintainer, I want the bank checked by tests (tier counts, distinct options, a source on every question), so that a bad question can't ship.
26. As a maintainer, I want a play to be fully determined by a seed and its answers, so that plays are reproducible, testable and restorable.

## Implementation Decisions

- **A quiz, not a game.** It doesn't use the shared play screen or the `Engine` contract. Those are built around a confidence meter and one guess, and this quiz has neither. It gets its own module and route, and reuses the shared look: Hallmark tokens and classes (`stock`, `sheet` and so on), Mali and Noto Sans Thai Looped, `BigButton`, the sound helpers and the sound toggle.
- **Module.** `src/games/prince-of-tennis/`, behind one `index.ts`, owns the question bank, the play logic and the score bands. It is pure TypeScript and has no React. The route `src/app/prince-of-tennis/` owns the UI.
- **Question shape.** The data shape, written as a type:

  ```ts
  type Tier = "easy" | "medium" | "hard" | "very-hard";

  interface QuizQuestion {
    readonly id: string;          // stable, so a saved play survives a reordered bank
    readonly tier: Tier;
    readonly prompt: string;      // Thai
    readonly answer: string;      // the right option's label
    readonly decoys: readonly [string, string, string];
    readonly note?: string;       // one line shown after the answer
    readonly source: string;      // https URL that confirms the answer
  }
  ```

  The bank is a typed TypeScript module keyed by id, as Anime Age's is, so a duplicate id is a compile error. A load-time check, like Anime Age's `defineBank`, rejects the rules the types can't express (see Testing Decisions).
- **Bank size.** At least 15 questions per tier, 60 in all. More is welcome.
- **Scope of facts.** The original manga, the TV anime, and the National Tournament OVAs, from the start of the story to the end of the National Tournament. No The New Prince of Tennis, films, musicals or games.
- **Accuracy.** The implementing session writes every question and checks it against a web source, such as the Prince of Tennis wiki or Wikipedia, and records that page's URL in `source`. A question that no source confirms is left out. There is no `unsure` marker: the user reviews the whole bank before release (`issues/01-review-question-bank.md`).
- **A play.** A play is a seed plus the answer keys so far, and every other field is derived from those two, as in Anime Age. From the seed, the play draws 5 distinct questions from each tier, orders them easy, medium, hard, very hard, and shuffles each question's four options. An answer key names the option chosen. The play exposes the current question, its number, the score so far, whether the last answer was right, and, after 20 answers, the result.
- **Score bands.** 5 bands over the score out of 20: 0–4, 5–8, 9–12, 13–16, 17–20. Each band has a Thai fan title and one line under it. The implementer writes the wording in the series' spirit, such as "ยังอ่อนหัดนัก" for the lowest band. The user can change it in review.
- **Screens.** An intro with เริ่มเลย. Then a question with four option buttons (number keys 1–4). After an answer the options lock, the chosen one shows right or wrong, the right one is marked, the note shows if there is one, and "ข้อต่อไป" (or Enter) moves on. The result shows the score, the band title, the answer list and เล่นอีกครั้ง. Right and wrong use colour, an icon and text together, never colour alone.
- **Sound.** Reuse `sound` moments: `start` on เริ่มเลย, `right` or `wrong` after each answer, and `guess` (the completion cue) on the result.
- **Refresh.** The play is saved after every answer as its seed and answer keys, in localStorage under `knowyou:play:prince-of-tennis`, and restored on mount. A record that fails to restore is dropped silently and the intro shows, as `docs/documents/play-screen.md` describes for the games. Reuse `src/lib/play-record.ts` only if it fits without bending it around the `Engine` type. Otherwise write a small sibling with the same rules.
- **Home page.** Add a ready entry: title "คุณรู้จัก Prince of Tennis ดีแค่ไหน", blurb "ตอบคำถาม 20 ข้อ แล้วดูว่าคุณเป็นแฟนระดับไหน".
- **Docs.** Add `docs/documents/prince-of-tennis-quiz.md`, covering the question shape, how a play is drawn, the bands, and how to add a question, and list it in `docs/documents/INDEX.md`.

## Testing Decisions

- **Good tests** assert what a player or an author can observe through the module's public interface, not its internals. Prior art: `src/games/anime-age/bank.test.ts` for bank checks, and `src/lib/play-record.test.ts` for save and restore.
- **One seam.** The `src/games/prince-of-tennis` public interface: the bank, starting a play from a seed, answering, and reading the result.
- **Bank validity.**
  - At least 15 questions per tier, with unique ids.
  - The four options of each question are distinct after trimming, and no decoy equals the answer.
  - Every `source` is an `https://` URL.
  - Prompts and options aren't empty.
- **Play behaviour.**
  - The same seed and answers give the same play.
  - A play has 20 distinct questions, 5 per tier, in tier order.
  - Over many seeds, the right answer lands in each of the four positions.
  - The score counts right answers. An unknown answer key is rejected. Nothing can be answered after question 20.
- **Bands.** Every score from 0 to 20 maps to exactly one band.
- **UI.** Verify in the running app (`/run`): play to the end with a mix of right and wrong answers, refresh mid-quiz and see the play restored, and check the home page entry.

## Out of Scope

- An adaptive quiz, or a guessed fan level with confidence. This was offered in grill Q1 and declined.
- Other series. The module and route are named for Prince of Tennis. Generalising waits for a second title.
- The New Prince of Tennis, the films, the musicals and the games.
- Images, screenshots and audio clips from the series.
- A timer, a "don't know" option, weighted scoring, a leaderboard, sharing, a backend and English.

## Further Notes

- **Glossary.** `GLOSSARY.md` gained **Quiz** in this session. A Quiz isn't a Game, so the Game entry's three-game list is unchanged.
- **Release gate.** The quiz can merge behind its home page entry only after `issues/01-review-question-bank.md` is done.

## Assumptions

Taken without asking, per `CLAUDE.md`. Veto any of these by editing this list.

- The route is `/prince-of-tennis` and the saved-play key is `knowyou:play:prince-of-tennis`.
- The quiz has its own screen, not the shared play screen.
- The 5 score bands are 0–4, 5–8, 9–12, 13–16 and 17–20, and the implementer writes their titles.
- Thai spellings follow what Thai fans use most. Where it is unclear, use the commonest spelling on Thai fan pages.
- A one-line note after an answer is optional for each question.
- The running score shows during play.
- A play survives a refresh, as the games' plays do.

## Grill decisions (2026-11-25)

- **Q1.** A plain scored quiz, not a KnowYou guessing game. The adaptive alternative was offered with sample questions and declined.
- **Q2.** 20 questions a play, 5 per tier (easy, medium, hard, very hard), drawn at random each play and shown easiest tier first. Right or wrong shows straight after each answer, with the right answer on a miss. No timer and no "don't know". The end shows the score out of 20, a fan title from 5 bands, the answer list and play again.
- **Q3.** The implementing session writes the bank and checks every question against a web source, and stores the source URL. Unconfirmed questions are dropped. The user reviews the bank before release.
- **Scope.** Prince of Tennis only. The manga, the TV anime and the National Tournament OVAs, up to the end of the National Tournament. No The New Prince of Tennis and no films.
