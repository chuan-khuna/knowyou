# Spec: คุณรู้จัก Naruto ดีแค่ไหน

Status: ready-for-agent

A second **Quiz** in the KnowYou app, beside the Prince of Tennis quiz. Terms follow `GLOSSARY.md`. The Prince of Tennis spec (`.scratch/how-well-do-you-know/spec.md`) is the precedent for every rule this spec doesn't restate. Its Out of Scope said "Generalising waits for a second title". This is the second title, so the quiz engine and screen become shared, and each title becomes its data plus its copy.

The user supplied the question bank in chat: 67 researched questions and 45 glosses, in the format of `docs/documents/prince-of-tennis-quiz-format.md`.

## Problem Statement

Thai Naruto fans want to test how well they know the series and get a fan title, the way Prince of Tennis fans can. The quiz code is named for and wired to Prince of Tennis: its bank, glossary, score bands, saved-play key and screen copy are module constants. A second title today means copying about a thousand lines.

## Solution

A quiz at `/naruto`, listed on the home page as "คุณรู้จัก Naruto ดีแค่ไหน". It plays exactly like the Prince of Tennis quiz: 20 questions, 5 per tier, easiest tier first, right or wrong after each answer, a score out of 20 and a fan title from 5 bands, plus the ตอบทุกข้อ mode over the whole bank. The fan titles are ninja ranks, from นักเรียนโรงเรียนนินจา up to โฮคาเงะ.

Under the hood, one shared quiz module plays any title, and one shared quiz screen shows it. Prince of Tennis and Naruto are each a small module holding their questions, glossary and score bands. The Prince of Tennis quiz looks and plays exactly as before, and its saved plays still restore.

## User Stories

1. As a Naruto fan, I want to start the Naruto quiz from the home page, so that I find it next to the other games.
2. As a player, I want the same intro, question, reveal and result screens as the Prince of Tennis quiz, so that both quizzes feel like one app.
3. As a player, I want 20 questions a play, 5 from each tier, easiest first, so that every play is equally hard.
4. As a player, I want different questions and option positions each play, so that playing again is still a test.
5. As a player, I want jutsu, dōjutsu, sword and element names to show their romaji, kanji and English names under the option, so that I recognise them whichever name I know.
6. As a player, I want a note after some answers, so that the reveal teaches me something.
7. As a player, I want a ninja-rank fan title for my score, so that the result is fun to read and share.
8. As a player, I want a ตอบทุกข้อ mode over all 67 questions, so that I can test myself on the whole bank.
9. As a player, I want a Naruto play in progress to survive a refresh, so that a reload doesn't lose my answers.
10. As a player of both quizzes, I want each quiz to keep its own saved play, so that starting one never wipes the other.
11. As a player who had a Prince of Tennis play in progress before this change, I want it to restore as before, so that the change costs me nothing.
12. As a player, I want the reset button in the top bar during a Naruto play, so that I can start over.
13. As a maintainer, I want a new quiz title to be a bank, a glossary, score bands and a route page, so that adding a third title is small.
14. As a maintainer, I want every shipped title's bank checked by the same rules (tier counts, distinct options, https sources, every gloss names an option, bands cover 0 to 20), so that a bad bank can't ship for any title.

## Implementation Decisions

- **Shared quiz module.** The play logic, question shape, bank and glossary parsing, bank rules, score-band lookup and saved-play record move out of the Prince of Tennis module into one shared, title-agnostic quiz module. It is pure TypeScript behind one `index.ts`, like the games' modules.
- **A title is data.** Each title module holds only its `questions.json`, `glossary.json` and score bands, and exports its quiz, built by the shared module from those three plus an id. The id is the route slug and names the saved play.

  ```ts
  interface QuizContent {
    readonly id: string;                    // "prince-of-tennis", "naruto"
    readonly bank: QuestionBank;            // from questions.json
    readonly glosses: Readonly<Record<string, Gloss>>; // from glossary.json
    readonly bands: readonly ScoreBand[];   // cover 0..20, lowest first
  }
  interface Quiz extends QuizContent {
    start(seed: number, mode?: QuizMode): AskingQuizPlay;
    answer(play: AskingQuizPlay, optionKey: string): QuizPlay;
  }
  ```

- **Bank rules per title.** The shipped-bank rules take the whole content, so one check covers the questions, the glosses (every gloss names an option) and the bands (every score 0 to 20 in exactly one band, each with a title and a line).
- **Saved play.** Stored under `knowyou:play:<id>`. Prince of Tennis keeps `knowyou:play:prince-of-tennis`, and the draw is unchanged, so its saved plays still restore.
- **Shared screen.** The Prince of Tennis screen becomes a shared quiz screen that takes the quiz, the title and the intro paragraphs, as the games' shared play screen does. Each route page is the metadata plus that screen.
- **Naruto bank.** The supplied bank goes in as it is: 67 questions (17 easy, 18 medium, 17 hard, 15 very hard) and 45 glosses, `evidence` kept. It already passes the bank rules.
- **Naruto bands.** 0–4, 5–8, 9–12, 13–16 and 17–20, as ninja ranks:

  | Score | Title | Line |
  | --- | --- | --- |
  | 0–4 | นักเรียนโรงเรียนนินจา | ยังสอบคาถาแยกร่างไม่ผ่านเลย กลับไปทบทวนกับอิรุกะเซนเซก่อนนะ |
  | 5–8 | เกะนินหน้าใหม่ | ได้ผ้าคาดหัวมาแล้ว แต่ภารกิจที่ได้ยังเป็นแค่ตามหาแมวหาย |
  | 9–12 | จูนิน | ผ่านการสอบจูนินมาได้ พร้อมนำทีมออกภารกิจของตัวเองแล้ว |
  | 13–16 | โจนินฝีมือฉกาจ | ฝีมือระดับนี้ พร้อมรับเกะนินมาปั้นเป็นทีมของตัวเองแบบคาคาชิแล้ว |
  | 17–20 | โฮคาเงะ | ทั้งหมู่บ้านยอมรับคุณแล้ว ใบหน้าของคุณควรไปอยู่บนผาโฮคาเงะ |

- **Naruto copy.** Title "คุณรู้จัก Naruto ดีแค่ไหน". Intro: "ตอบคำถาม 20 ข้อ เรื่องราวตั้งแต่ภาคแรกจนจบสงครามนินจาครั้งที่สี่ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ ยากขึ้น", then the same second line as Prince of Tennis. Home page blurb "ตอบคำถาม 20 ข้อ แล้วดูว่าคุณเป็นนินจาระดับไหน".
- **Docs.** The Prince of Tennis quiz document becomes one quiz document covering the shared module, how to add a title, and each title's bands. `INDEX.md`, `GLOSSARY.md` (the Quiz entry names its titles) and the research format doc's links follow.

## Testing Decisions

- **Good tests** assert what a player or an author can observe through a module's public interface. The existing Prince of Tennis tests are the prior art and move with the code they test: play behaviour, all mode, saved play and bank rules run against a fixture title in the shared module.
- **Per title.** Each title module has one test that its shipped content passes every bank rule, and a boundaries test like the games' modules.
- **Compatibility.** A Prince of Tennis record saved before the change restores to the same play after it. Prove it by encoding a play on the old code and restoring it on the new.
- **UI.** In the running app: the home page lists both quizzes; a Naruto play runs to the result with a ninja-rank title; a gloss shows under a jutsu option; a refresh mid-play restores it; and the Prince of Tennis quiz still plays and restores.

## Out of Scope

- A research brief for new Naruto questions, like `prince-of-tennis-quiz-format.md`. Add one when the Naruto bank grows.
- Boruto, the films and the games.
- Changes to how a quiz plays, scores or looks.
- A generic `[quiz]` dynamic route or a quiz registry. Two static routes are simpler while there are two titles.

## Assumptions

Taken without asking, per `CLAUDE.md`. Veto any of these by editing this list.

- The route is `/naruto` and the saved-play key is `knowyou:play:naruto`.
- The title uses the English series name, as Prince of Tennis does: "คุณรู้จัก Naruto ดีแค่ไหน".
- The scope is Naruto and Naruto Shippuden, up to the end of the Fourth Shinobi World War, which is what the supplied bank covers.
- The fan titles are the ninja ranks in the table above. Change the wording freely.
- The supplied bank ships as it is, with no review gate: the user researched it, and every question carries a source and evidence.
- The Prince of Tennis quiz moves onto the shared module in the same change, with no change a player can see.

## Comments

- 2026-11-26: The user sent a revised bank that uses Thai names for jutsu, eyes, swords and elements, such as กระสุนวงจักร, พันปักษา, เนตรวงแหวน and ดาบหนังฉลาม. It keeps the same 67 ids, changes 30 questions, and has 42 glosses. It replaced the first bank as it is.
